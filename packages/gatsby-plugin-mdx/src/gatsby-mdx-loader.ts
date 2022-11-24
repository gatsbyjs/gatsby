/* eslint-disable @babel/no-invalid-this */
import type { ProcessorOptions } from "@mdx-js/mdx"
import type { NodePluginArgs } from "gatsby"
import type { LoaderDefinition } from "webpack"
import { slash } from "gatsby-core-utils/path"
import { createFileToMdxCacheKey } from "./cache-helpers"
import { compileMDX } from "./compile-mdx"

export interface IGatsbyMDXLoaderOptions {
  options: ProcessorOptions
  getNode: NodePluginArgs["getNode"]
  cache: NodePluginArgs["cache"]
  reporter: NodePluginArgs["reporter"]
}

// Custom MDX Loader that compiles MDX to JSX
const gatsbyMDXLoader: LoaderDefinition = async function (source) {
  const { options, getNode, cache, reporter } =
    this.getOptions() as IGatsbyMDXLoaderOptions
  const resourcePath = slash(this.resourcePath)
  const mdxNodeId = await cache.get(createFileToMdxCacheKey(resourcePath))

  if (!mdxNodeId) {
    return source
  }

  const mdxNode = getNode(mdxNodeId)
  if (!mdxNode) {
    return source
  }

  const compileRes = await compileMDX(
    // We want to work with the transformed source from our layout plugin
    {
      absolutePath: resourcePath,
      source: mdxNode.body as string,
    },
    options,
    cache,
    reporter
  )

  if (compileRes?.processedMDX) {
    return compileRes.processedMDX
  }

  return source
}

export default gatsbyMDXLoader
