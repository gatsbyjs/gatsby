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

---

<File path="foo2.js" content="/** foo2 */" />
<NPMPackage name="gatsby" />
`

test(`handles MDX as input`, async () => {
  const result = await render(mdxFixture)

  expect(result).toMatchInlineSnapshot(`
    Array [
      Object {
        "currentState": "",
        "describe": "Write foo.js",
        "diff": "- Original  - 0
    + Modified  + 1

    + /** foo */",
        "newState": "/** foo */",
        "resourceDefinitions": Object {
          "content": "/** foo */",
          "path": "foo.js",
        },
        "resourceName": "File",
      },
      Object {
        "currentState": "",
        "describe": "Write foo2.js",
        "diff": "- Original  - 0
    + Modified  + 1

    + /** foo2 */",
        "newState": "/** foo2 */",
        "resourceDefinitions": Object {
          "content": "/** foo2 */",
          "path": "foo2.js",
        },
        "resourceName": "File",
      },
      Object {
        "currentState": "gatsby@2.21.28",
        "describe": "Install gatsby@latest",
        "newState": "gatsby@latest",
        "resourceDefinitions": Object {
          "name": "gatsby",
        },
        "resourceName": "NPMPackage",
      },
    ]
  `)
})

test(`handles MDX JSX output`, async () => {
  const jsx = mdx.sync(mdxFixture, { skipExport: true })

  const result = await render(jsx)

  expect(result).toMatchInlineSnapshot(`
    Array [
      Object {
        "currentState": "",
        "describe": "Write foo.js",
        "diff": "- Original  - 0
    + Modified  + 1

    + /** foo */",
        "newState": "/** foo */",
        "resourceDefinitions": Object {
          "content": "/** foo */",
          "path": "foo.js",
        },
        "resourceName": "File",
      },
      Object {
        "currentState": "",
        "describe": "Write foo2.js",
        "diff": "- Original  - 0
    + Modified  + 1

    + /** foo2 */",
        "newState": "/** foo2 */",
        "resourceDefinitions": Object {
          "content": "/** foo2 */",
          "path": "foo2.js",
        },
        "resourceName": "File",
      },
      Object {
        "currentState": "gatsby@2.21.28",
        "describe": "Install gatsby@latest",
        "newState": "gatsby@latest",
        "resourceDefinitions": Object {
          "name": "gatsby",
        },
        "resourceName": "NPMPackage",
      },
    ]
  `)
})

test(`returns a plan for the step`, async () => {
  const result = await render(fixture)

  expect(result).toMatchInlineSnapshot(`
    Array [
      Object {
        "currentState": "",
        "describe": "Write foo.js",
        "diff": "- Original  - 0
    + Modified  + 1

    + /** foo */",
        "newState": "/** foo */",
        "resourceDefinitions": Object {
          "content": "/** foo */",
          "path": "foo.js",
        },
        "resourceName": "File",
      },
    ]
  `)
})
