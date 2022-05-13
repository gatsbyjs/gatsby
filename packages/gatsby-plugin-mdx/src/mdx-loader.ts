/* eslint-disable @babel/no-invalid-this */
import type { Node } from "gatsby"
import type { LoaderDefinition } from "webpack"

import grayMatter from "gray-matter"
import { getOptions } from "loader-utils"
import type { Options } from "mdast-util-to-markdown"

import { defaultOptions, IMdxPluginOptions } from "./plugin-options"

interface IFileNode extends Node {
  sourceInstanceName: string
}

export interface IMdxLoaderOptions {
  pluginOptions: IMdxPluginOptions
  fileMap: Map<string, IFileNode>
}

// Wrap MDX content with Gatsby Layout component and inject components from `@mdx-js/react`
const gatsbyMdxLoader: LoaderDefinition = async function (source) {
  const { pluginOptions, fileMap }: IMdxLoaderOptions = getOptions(this)

  const options = defaultOptions(pluginOptions)

  const fileNode = fileMap.get(this.resourcePath)

  if (!fileNode) {
    throw new Error(
      `Unable to locate GraphQL File node for ${this.resourcePath}`
    )
  }

  // get the default layout for the file source group, or if it doesn't
  // exist, the overall default layout
  const layoutPath =
    options.defaultLayouts[fileNode.sourceInstanceName] ||
    options.defaultLayouts[`default`]

  // No default layout set? Nothing to do here!
  if (!layoutPath) {
    return source
  }

  // Remove frontmatter
  const { content } = grayMatter(source)

  const { fromMarkdown } = await import(`mdast-util-from-markdown`)
  const { toMarkdown } = await import(`mdast-util-to-markdown`)

  const { mdxjs } = await import(`micromark-extension-mdxjs`)
  const { mdxFromMarkdown, mdxToMarkdown } = await import(`mdast-util-mdx`)

  // Parse MDX to AST
  const tree = fromMarkdown(content, {
    extensions: [mdxjs()],
    mdastExtensions: [mdxFromMarkdown()],
  })

  const hasDefaultExport = !!tree.children.find(
    child =>
      typeof child.value === `string` &&
      child.value.indexOf(`export default`) !== -1
  )

  if (hasDefaultExport) {
    return content
  }

  tree.children.unshift({
    type: `mdxjsEsm` as `text`,
    value: `import GatsbyMDXLayout from "${layoutPath}"`,
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

export default gatsbyMdxLoader
