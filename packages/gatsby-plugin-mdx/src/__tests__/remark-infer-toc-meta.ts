import { createProcessor } from "@mdx-js/mdx"
import { toc } from "mdast-util-toc"
import { visit } from "unist-util-visit"
import rehypeMetadataExtractor from "../rehype-metadata-extractor"
import remarkInferTocMeta from "../remark-infer-toc-meta"

const source = `# Headline

Some text with *formatting*.

## Headline 2

With some text beneath`

describe(`remark: infer ToC meta`, () => {
  it(`parses ToC and attaches it to our meta object`, async () => {
    const processor = createProcessor({
      remarkPlugins: [[remarkInferTocMeta, { toc, visit }]],
      rehypePlugins: [rehypeMetadataExtractor],
    })

    await processor.process(source)
    const meta = processor.data(`mdxMetadata`)
    expect(meta).toMatchObject({
      toc: {
        items: [
          {
            items: [
              {
                title: `Headline 2`,
                url: `#headline-2`,
              },
            ],
            title: `Headline`,
            url: `#headline`,
          },
        ],
      },
    })
  })
})
