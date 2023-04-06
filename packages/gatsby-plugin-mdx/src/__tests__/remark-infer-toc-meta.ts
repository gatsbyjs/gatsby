import { createProcessor } from "@mdx-js/mdx"
import { toc } from "mdast-util-toc"
import { visit } from "unist-util-visit"
import rehypeMetadataExtractor from "../rehype-metadata-extractor"
import remarkInferTocMeta from "../remark-infer-toc-meta"

const source = `# Headline

Some text with *formatting*.

## Headline 2

With some text beneath

## This heading has **bold** and *italicized* text

## This heading has \`inline code\`

## This heading contains a [link](#)`

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
              {
                title: `This heading has bold and italicized text`,
                url: `#this-heading-has-bold-and-italicized-text`,
              },
              {
                title: `This heading has inline code`,
                url: `#this-heading-has-inline-code`,
              },
              {
                title: `This heading contains a link`,
                url: `#this-heading-contains-a-link`,
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
