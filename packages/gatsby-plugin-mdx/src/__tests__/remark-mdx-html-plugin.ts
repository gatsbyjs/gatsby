import { unified } from "unified"
import remarkMdx from "remark-mdx"
import remarkStringify from "remark-stringify"
import remarkParse from "remark-parse"

import { remarkMdxHtmlPlugin } from "../remark-mdx-html-plugin"

const source = `# Some MDX

<img src="mocked"/>
`

describe(`remark: infer ToC meta`, () => {
  it(`parses ToC and attaches it to our meta object`, async () => {
    const processor = unified()
      .use(remarkParse)
      .use(remarkMdx)
      .use(remarkMdxHtmlPlugin)
      .use(remarkStringify)
    const res = await processor.process(source)

    expect(res).toMatchInlineSnapshot(`
      VFile {
        "contents": "# Headline

      Some text with *formatting*.

      ## Headline 2

      With some text beneath
      ",
        "cwd": "<PROJECT_ROOT>",
        "data": Object {},
        "history": Array [],
        "messages": Array [],
      }
    `)
  })
})
