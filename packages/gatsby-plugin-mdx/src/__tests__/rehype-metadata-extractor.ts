import type { Plugin } from "unified"
import { rehype } from "rehype"
import rehypeMetadataExtractor from "../rehype-metadata-extractor"

const rehypeMdxMetadataInjector: Plugin = function () {
  return (_tree, file): void => {
    file.data.meta = { injected: true }
  }
}

it(`rehype: extracts metadata and exposes it through processor.data()`, async () => {
  const processor = rehype()
    .use(rehypeMdxMetadataInjector)
    .use(rehypeMetadataExtractor)

  processor.data(`mdxMetadata`, {})

  processor.processSync(``)

  expect(processor.data(`mdxMetadata`)).toMatchObject({ injected: true })
})
