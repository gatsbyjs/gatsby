import deepmerge from "deepmerge"
import type { NodePluginArgs, PluginOptions } from "gatsby"
import type { ProcessorOptions } from "@mdx-js/mdx"
import type { IMdxMetadata } from "./types"
import { enhanceMdxOptions, IMdxPluginOptions } from "./plugin-options"
import { ERROR_CODES } from "./error-utils"
import { cachedImport, createFileToMdxCacheKey } from "./cache-helpers"

// Compiles MDX into JS
// Differences to original @mdx-js/loader:
// * We pass the MDX node and a metadata object to the processor
// * We inject the path to the original mdx file into the VFile which is used by the processor
export async function compileMDX(
  { absolutePath, source }: { absolutePath: string; source: string | Buffer },
  options: ProcessorOptions,
  cache: NodePluginArgs["cache"],
  reporter: NodePluginArgs["reporter"]
): Promise<{ processedMDX: string; metadata: IMdxMetadata } | null> {
  try {
    const { createProcessor } = await cachedImport<
      typeof import("@mdx-js/mdx")
    >(`@mdx-js/mdx`)
    const { VFile } = await cachedImport<typeof import("vfile")>(`vfile`)

    const processor = createProcessor(options)

    // Pass required custom data into the processor
    processor.data(
      `mdxNodeId`,
      await cache.get(createFileToMdxCacheKey(absolutePath))
    )
    processor.data(`mdxMetadata`, {})

    const result = await processor.process(
      // Inject path to original file for remark plugins. See: https://github.com/gatsbyjs/gatsby/issues/26914
      new VFile({ value: source, path: absolutePath })
    )

    // Clone metadata so ensure it won't be overridden by later processings
    const clonedMetadata = Object.assign(
      {},
      processor.data(`mdxMetadata`) as IMdxMetadata
    )
    const processedMDX = result.toString()

    return { processedMDX, metadata: clonedMetadata }
  } catch (error) {
    reporter.panicOnBuild({
      id: ERROR_CODES.MdxCompilation,
      context: {
        absolutePath,
        errorMeta: error,
      },
    })
    return null
  }
}

/**
 * This helper function allows you to inject additional plugins and configuration into the MDX
 * compilation pipeline. Very useful to create your own resolvers that return custom metadata.
 * Internally used to generate the tables of contents and the excerpts.
 */
export const compileMDXWithCustomOptions = async (
  { absolutePath, source }: { absolutePath: string; source: string | Buffer },
  {
    pluginOptions,
    customOptions,
    getNode,
    getNodesByType,
    pathPrefix,
    reporter,
    cache,
    store,
  }: {
    pluginOptions: PluginOptions
    customOptions: Partial<IMdxPluginOptions>
    getNode: NodePluginArgs["getNode"]
    getNodesByType: NodePluginArgs["getNodesByType"]
    pathPrefix: string
    reporter: NodePluginArgs["reporter"]
    cache: NodePluginArgs["cache"]
    store: NodePluginArgs["store"]
  }
): Promise<{
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
    store,
  })

  // Compile MDX and extract metadata
  return compileMDX(
    {
      source: source,
      absolutePath: absolutePath,
    },
    mdxOptions,
    cache,
    reporter
  )
}
