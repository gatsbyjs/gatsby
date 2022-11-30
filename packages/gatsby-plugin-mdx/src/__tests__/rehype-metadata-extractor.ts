import type { Plugin } from "unified"

import { createProcessor } from "@mdx-js/mdx"
import rehypeMetadataExtractor from "../rehype-metadata-extractor"

const rehypeMdxMetadataInjector: Plugin = function () {
  return (_tree, file): void => {
    file.data.meta = { injected: true }
  }
}

it(`rehype: extracts metadata and exposes it through processor.data()`, async () => {
  const processor = createProcessor({
    rehypePlugins: [rehypeMdxMetadataInjector, rehypeMetadataExtractor],
  })

  await processor.process(``)

  expect(processor.data(`mdxMetadata`)).toMatchObject({ injected: true })
})
