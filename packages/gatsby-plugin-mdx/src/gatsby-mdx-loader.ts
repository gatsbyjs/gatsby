/* eslint-disable @babel/no-invalid-this */
import { createHash } from "crypto"
import type { ProcessorOptions } from "@mdx-js/mdx"
import type { NodePluginArgs } from "gatsby"
import type { LoaderDefinition } from "webpack"
import { slash } from "gatsby-core-utils/path"
import { createFileToMdxCacheKey } from "./cache-helpers"
import { compileMDX } from "./compile-mdx"
import { parseFrontmatter } from "./frontmatter"

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

  // Compile the source webpack just read instead of the Mdx node body. On save,
  // webpack can rebuild before the node is updated, and the stale body would
  // then stay on the page. The md5 key matches a File node's default
  // contentDigest, so this shares one parse with onCreateNode.
  const { body } = parseFrontmatter(
    createHash(`md5`).update(source).digest(`hex`),
    source
  )

  const compileRes = await compileMDX(
    {
      absolutePath: resourcePath,
      source: body,
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
