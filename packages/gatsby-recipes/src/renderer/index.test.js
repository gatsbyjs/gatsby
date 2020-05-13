const mdx = require(`@mdx-js/mdx`)

const render = require(`.`)

const fixture = `
  <div>
    <File path="foo.js" content="/** foo */" />
  </div>
`

const mdxFixture = `
# Hello, world!

---

Write a file!

<File path="foo.js" content="/** foo */" />
`

test(`handles MDX as input`, async () => {
  const result = await render(mdxFixture)

  expect(result).toMatchInlineSnapshot(`
    Object {
      "children": Array [
        Object {
          "children": Array [
            Object {
              "text": "{\\"currentState\\":\\"\\",\\"newState\\":\\"/** foo */\\",\\"describe\\":\\"Write foo.js\\",\\"diff\\":null}",
            },
          ],
          "props": Object {
            "children": "{\\"currentState\\":\\"\\",\\"newState\\":\\"/** foo */\\",\\"describe\\":\\"Write foo.js\\",\\"diff\\":null}",
          },
          "type": "File",
        },
      ],
    }
  `)
})

test(`handles MDX JSX output`, async () => {
  const jsx = mdx.sync(mdxFixture, { skipExport: true })

  const result = await render(jsx)

  expect(result).toMatchInlineSnapshot(`
    Object {
      "children": Array [
        Object {
          "children": Array [
            Object {
              "text": "{\\"currentState\\":\\"\\",\\"newState\\":\\"/** foo */\\",\\"describe\\":\\"Write foo.js\\",\\"diff\\":null}",
            },
          ],
          "props": Object {
            "children": "{\\"currentState\\":\\"\\",\\"newState\\":\\"/** foo */\\",\\"describe\\":\\"Write foo.js\\",\\"diff\\":null}",
          },
          "type": "File",
        },
      ],
    }
  `)
})

test(`returns a plan for the step`, async () => {
  const result = await render(fixture)

  expect(result).toMatchInlineSnapshot(`
    Object {
      "children": Array [
        Object {
          "children": Array [
            Object {
              "children": Array [
                Object {
                  "text": "{\\"currentState\\":\\"\\",\\"newState\\":\\"/** foo */\\",\\"describe\\":\\"Write foo.js\\",\\"diff\\":null}",
                },
              ],
              "props": Object {
                "children": "{\\"currentState\\":\\"\\",\\"newState\\":\\"/** foo */\\",\\"describe\\":\\"Write foo.js\\",\\"diff\\":null}",
              },
              "type": "File",
            },
          ],
          "props": Object {
            "children": <File
              content="/** foo */"
              path="foo.js"
            />,
          },
          "type": "div",
        },
      ],
    }
  `)
})
