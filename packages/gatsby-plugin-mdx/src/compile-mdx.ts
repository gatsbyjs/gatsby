import type { NodePluginArgs } from "gatsby"
import type { ProcessorOptions } from "@mdx-js/mdx"
import type { IFileNode, IMdxMetadata, IMdxNode } from "./types"

import deepmerge from "deepmerge"

import { enhanceMdxOptions, IMdxPluginOptions } from "./plugin-options"

// Compiles MDX into JS
// This could be replaced by @mdx-js/mdx if MDX compile would
// accept custom data passed to the unified pipeline via processor.data()
export async function compileMDX(
  mdxNode: IMdxNode,
  fileNode: IFileNode,
  options: ProcessorOptions
): Promise<{ processedMDX: string; metadata: IMdxMetadata }> {
  try {
    const { createProcessor } = await import(`@mdx-js/mdx`)
    const { VFile } = await import(`vfile`)

    const processor = createProcessor(options)

    // If we could pass this via MDX loader config, this whole custom loader might be obsolete.
    const metadata: IMdxMetadata = {}
    processor.data(`mdxNode`, mdxNode)
    processor.data(`mdxMetadata`, metadata)

    const result = await processor.process(
      // Inject path to original file for remark plugins. See: https://github.com/gatsbyjs/gatsby/issues/26914
      new VFile({ value: mdxNode.body, path: fileNode.absolutePath })
    )

    // Clone metadata so ensure it won't be overridden by later processings
    const clonedMetadata = Object.assign(
      {},
      processor.data(`mdxMetadata`) as IMdxMetadata
    )
    const processedMDX = result.toString()

    return { processedMDX, metadata: clonedMetadata }
  } catch (err) {
    const errorMeta = [
      mdxNode.title && `Title: ${mdxNode.title}`,
      mdxNode.slug && `Slug: ${mdxNode.slug}`,
      mdxNode.frontmatter &&
        `Frontmatter:\n${JSON.stringify(mdxNode.frontmatter, null, 2)}`,
      fileNode.absolutePath && `Path: ${fileNode.absolutePath}`,
      mdxNode.body && `Content:\n ${mdxNode.body}`,
    ]
      .filter(Boolean)
      .join(`\n`)

    err.message = `Unable to compile MDX:\n${errorMeta}\n\n---\nOriginal error:\n\n${err.message}`
    throw err
  }
}

/**
 * This helper function allows you to inject additional plugins and configuration into the MDX
 * compilation pipeline. Very useful to create your own resolvers that return custom metadata.
 * Internally used to generate the tables of contents and the excerpts.
 */
export const compileMDXWithCustomOptions = async ({
  pluginOptions,
  customOptions,
  getNode,
  getNodesByType,
  pathPrefix,
  reporter,
  cache,
  mdxNode,
}: {
  pluginOptions: IMdxPluginOptions
  customOptions: Partial<IMdxPluginOptions>
  getNode: NodePluginArgs["getNode"]
  getNodesByType: NodePluginArgs["getNodesByType"]
  pathPrefix: string
  reporter: NodePluginArgs["reporter"]
  cache: NodePluginArgs["cache"]
  mdxNode: IMdxNode
}): Promise<{
  processedMDX: string
  metadata: IMdxMetadata
} | null> => {
  const customPluginOptions = deepmerge(
    Object.assign({}, pluginOptions),
    customOptions
  )

  // Prepare MDX compile
  const mdxOptions = await enhanceMdxOptions(customPluginOptions, {
    getNode,
    getNodesByType,
    pathPrefix,
    reporter,
    cache,
  })
  if (!mdxNode.parent) {
    return null
  }
  const fileNode = getNode(mdxNode.parent)
  if (!fileNode) {
    return null
  }

  // Compile MDX and extract metadata
  return compileMDX(mdxNode, fileNode, mdxOptions)
}
