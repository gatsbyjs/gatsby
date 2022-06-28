/* eslint-disable @babel/no-invalid-this */
import type { ProcessorOptions } from "@mdx-js/mdx"
import type { NodePluginArgs } from "gatsby"
import type { LoaderDefinition } from "webpack"
import type { NodeMap } from "./types"

import { getOptions } from "loader-utils"

import { compileMDX } from "./compile-mdx"

export interface IGatsbyMDXLoaderOptions {
  options: ProcessorOptions
  nodeMap: NodeMap
  reporter: NodePluginArgs["reporter"]
}

// Custom MDX Loader that injects the GraphQL MDX node into plugin data
// This whole loaded could be replaced by @mdx-js/loader if MDX would
// accept custom data passed to the unified pipeline via processor.data()
const gatsbyMDXLoader: LoaderDefinition = async function (source) {
  const { options, nodeMap, reporter }: IGatsbyMDXLoaderOptions =
    getOptions(this)
  const res = nodeMap.get(this.resourcePath)

  if (!res) {
    return source
  }

  const { mdxNode, fileNode } = res

  const compileRes = await compileMDX(
    // We want to work with the transformed source from our layout plugin
    { ...mdxNode, body: source },
    fileNode,
    options,
    reporter
  )

  if (compileRes && compileRes.processedMDX) {
    return compileRes.processedMDX
  }

  return source
}

export default gatsbyMDXLoader
