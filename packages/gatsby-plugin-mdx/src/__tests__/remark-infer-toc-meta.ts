import { visit } from "unist-util-visit"
import { toc } from "mdast-util-toc"

import remarkInferTocMeta from "../remark-infer-toc-meta"
import remark from "remark"

const source = `# Headline

Some text with *formatting*.

## Headline 2

With some text beneath`

describe(`remark: infer ToC meta`, () => {
  it(`parses ToC and attaches it to our meta object`, async () => {
    const processor = remark().use(remarkInferTocMeta, {
      toc,
      visit,
      maxDepth: 6,
    })
    await processor.parse(source)

    expect(processor.data(`meta`)).toMatchInlineSnapshot()
  })
})
