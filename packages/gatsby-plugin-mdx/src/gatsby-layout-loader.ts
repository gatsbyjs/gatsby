/* eslint-disable @babel/no-invalid-this */
import type { LoaderDefinition } from "webpack"
import type { NodeMap } from "./types"
import type { IMdxPluginOptions } from "./plugin-options"

import { getOptions } from "loader-utils"

export interface IGatsbyLayoutLoaderOptions {
  options: IMdxPluginOptions
  nodeMap: NodeMap
}

// Wrap MDX content with Gatsby Layout component
const gatsbyLayoutLoader: LoaderDefinition = async function (source) {
  const { nodeMap }: IGatsbyLayoutLoaderOptions = getOptions(this)

  const mdxPath = this.resourceQuery.split(`__mdxPath=`)[1]

  const res = nodeMap.get(mdxPath)

  if (!res) {
    throw new Error(
      `Unable to locate GraphQL File node for ${this.resourcePath}`
    )
  }

  // @todo this should be an AST transformation and not string manipulation
  return `import RENDERED_MDX from "${mdxPath}"\n${source}\nconsole.log(RENDERED_MDX)`
}

export default gatsbyLayoutLoader
