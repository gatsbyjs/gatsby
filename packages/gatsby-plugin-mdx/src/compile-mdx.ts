import type { ProcessorOptions } from "@mdx-js/mdx"
import { cloneDeep } from "lodash"
import type { IFileNode, IMdxMetadata, IMdxNode } from "./types"

// Compiles MDX into JS
// This could be replaced by @mdx-js/mdx if MDX compile would
// accept custom data passed to the unified pipeline via processor.data()
export default async function compileMDX(
  mdxNode: IMdxNode,
  fileNode: IFileNode,
  options: ProcessorOptions
): Promise<{ processedMDX: string; metadata: IMdxMetadata }> {
  try {
    const { createProcessor } = await import(`@mdx-js/mdx`)
    const { VFile } = await import(`vfile`)

    const processor = createProcessor(cloneDeep(options))

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
