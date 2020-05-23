const render = require(`.`)

const mdxFixture = `
# Hello, world!

<File path="foo.js" content="/** foo */" />
<File path="foo2.js" content="/** foo2 */" />
<NPMPackage name="gatsby" />
`

describe(`renderer`, () => {
  test(`handles MDX as input`, async () => {
    const result = await render(mdxFixture)

    // Gatsby latest version is ever changing so we use regex matcher for currentState property.
    // Unfortunately jest property matchers work weirdly on arrays so instead
    // of snapshotting entitre result array it's split into few pieces.

    expect(result.length).toEqual(3)
    expect(result[0]).toMatchInlineSnapshot(`
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
      }
    `)
    expect(result[1]).toMatchInlineSnapshot(`
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
      }
    `)
    expect(result[2]).toMatchInlineSnapshot(
      {
        currentState: expect.stringMatching(/gatsby@[0-9.]+/),
      },
      `
      Object {
        "currentState": StringMatching /gatsby@\\[0-9\\.\\]\\+/,
        "describe": "Install gatsby@latest",
        "newState": "gatsby@latest",
        "resourceDefinitions": Object {
          "name": "gatsby",
        },
        "resourceName": "NPMPackage",
      }
    `
    )
  })

  test(`handles JSX with a single component`, async () => {
    const result = await render(`<File path="hi.md" content="hi" />`)

    expect(result).toMatchInlineSnapshot(`
      Array [
        Object {
          "currentState": "",
          "describe": "Write hi.md",
          "diff": "- Original  - 0
      + Modified  + 1

      + hi",
          "newState": "hi",
          "resourceDefinitions": Object {
            "content": "hi",
            "path": "hi.md",
          },
          "resourceName": "File",
        },
      ]
    `)
  })

  test(`returns a plan for nested JSX`, async () => {
    const result = await render(`<div>
  <File path="foo.js" content="/** foo */" />
</div>
    `)

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

  test(`handles introduction step with config`, async () => {
    const result = await render(`# Setup Theme UI

This recipe helps you start developing with the [Theme UI](https://theme-ui.com) styling library.

<Config name="gatsbyjs/add-theme-ui" />`)

    expect(result).toMatchInlineSnapshot(`Array []`)
  })
})
