/* eslint-disable @babel/no-invalid-this */
import type { LoaderDefinition } from "webpack"
import type { Options } from "mdast-util-to-markdown"
import type { NodeMap } from "./types"
import type { IMdxPluginOptions } from "./plugin-options"

import { getOptions } from "loader-utils"

export interface IGatsbyLayoutLoaderOptions {
  options: IMdxPluginOptions
  nodeMap: NodeMap
}

// Wrap MDX content with Gatsby Layout component
const gatsbyLayoutLoader: LoaderDefinition = async function () {
  const { options, nodeMap }: IGatsbyLayoutLoaderOptions = getOptions(this)

  const res = nodeMap.get(this.resourcePath)

  if (!res) {
    throw new Error(
      `Unable to locate GraphQL File node for ${this.resourcePath}`
    )
  }

  if (!res.mdxNode.body) {
    throw new Error(
      `MDX node is empty: ${JSON.stringify(res.mdxNode, null, 2)}`
    )
  }

  const { sourceInstanceName } = res.fileNode

  // Get the default layout for the file source instance group name,
  // or fall back to the default
  const layoutPath =
    (sourceInstanceName && options.defaultLayouts[sourceInstanceName]) ||
    options.defaultLayouts[`default`]

  // No default layout set? Nothing to do here!
  if (!layoutPath) {
    return res.mdxNode.body
  }

  const { fromMarkdown } = await import(`mdast-util-from-markdown`)
  const { toMarkdown } = await import(`mdast-util-to-markdown`)

  const { mdxjs } = await import(`micromark-extension-mdxjs`)
  const { mdxFromMarkdown, mdxToMarkdown } = await import(`mdast-util-mdx`)

  // Parse MDX to AST
  const tree = fromMarkdown(res.mdxNode.body, {
    extensions: [mdxjs()],
    mdastExtensions: [mdxFromMarkdown()],
  })

  const hasDefaultExport = !!tree.children.find(
    child =>
      typeof child.value === `string` &&
      child.value.indexOf(`export default`) !== -1
  )

  if (hasDefaultExport) {
    return res.mdxNode.body
  }

  tree.children.unshift({
    type: `mdxjsEsm` as `text`,
    value: `import GatsbyMDXLayout from "${layoutPath}"`,
  })
  tree.children.push({
    type: `mdxjsEsm` as `text`,
    value: `export * from "${layoutPath}"`,
  })

  tree.children.push({
    type: `mdxjsEsm` as `text`,
    value: `export default GatsbyMDXLayout`,
  })
  const out = toMarkdown(tree, {
    extensions: [mdxToMarkdown() as Options],
  })

  return out
}

export default gatsbyLayoutLoader
