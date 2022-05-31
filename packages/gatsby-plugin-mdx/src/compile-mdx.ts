import type { ProcessorOptions } from "@mdx-js/mdx"
import type { IFileNode, IMdxNode } from "./types"

// Compiles MDX into JS
// This could be replaced by @mdx-js/mdx if MDX compile would
// accept custom data passed to the unified pipeline via processor.data()
export default async function compileMDX(
  source: string,
  mdxNode: IMdxNode,
  fileNode: IFileNode,
  options: ProcessorOptions
): Promise<string> {
  const { createProcessor } = await import(`@mdx-js/mdx`)
  const { VFile } = await import(`vfile`)

  const processor = createProcessor(options)

  // If we could pass this via MDX loader config, this whole custom loader might be obsolete.
  processor.data(`mdxNode`, mdxNode)

  const result = await processor.process(
    // Inject path to original file for remark plugins. See: https://github.com/gatsbyjs/gatsby/issues/26914
    new VFile({ value: source, path: fileNode.absolutePath })
  )

  return result.toString()
}
