import type { ProcessorOptions } from "@mdx-js/mdx"

import { Node } from "gatsby"

// Compiles MDX into JS
// This could be replaced by @mdx-js/mdx if MDX compile would
// accept custom data passed to the unified pipeline via processor.data()
export default async function compileMDX(
  source: string,
  mdxNode: Node,
  options: ProcessorOptions
): Promise<string> {
  const { createProcessor } = await import(`@mdx-js/mdx`)
  const { VFile } = await import(`vfile`)

  const processor = createProcessor(options)

  // If we could pass this via MDX loader config, this whole custom loader might be obsolete.
  processor.data(`mdxNode`, mdxNode)

  console.dir(`@todo add path`, { mdxNode })

  const result = await processor.process(
    // Inject path to original file for remark plugins. See: https://github.com/gatsbyjs/gatsby/issues/26914
    new VFile({ value: source, path: `/at/todo/foo.mdx` })
  )

  return result.toString()
}
