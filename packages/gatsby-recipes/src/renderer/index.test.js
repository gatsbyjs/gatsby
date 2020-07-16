const render = require(`.`)
const { parse } = require(`../parser`)

const mdxFixture = `
# Hello, world!

---

export const fooContent = 'hiiiiii!'

<File path="foo.js" content={fooContent} />
<File path="foo2.js" content="/** foo2 */" />
<NPMPackage name="gatsby" />
`

describe(`renderer`, () => {
  test(`handles MDX as input`, async () => {
    const { stepsAsMdx } = await parse(mdxFixture)
    const result = await render(stepsAsMdx.join(`\n`))

    // Gatsby latest version is ever changing so we use regex matcher for currentState property.
    // Unfortunately jest property matchers work weirdly on arrays so instead
    // of snapshotting entitre result array it's split into few pieces.

    expect(result.length).toEqual(3)
    expect(result[0]).toMatchInlineSnapshot(`
      Object {
        "_stepMetadata": Object {},
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
        "_stepMetadata": Object {},
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
        "_stepMetadata": Object {},
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
          "_stepMetadata": Object {},
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

  test(`handles exports and allows them to be used as local variables`, async () => {
    const { stepsAsMdx } = await parse(`
# Hello, world!

---

export const myVar = 'hi.mdx'

<File path={myVar} content="hello" />
    `)

    const parsedMdx = stepsAsMdx.join(`\n`)
    const result = await render(parsedMdx)

    expect(result).toMatchInlineSnapshot(`
      Array [
        Object {
          "_stepMetadata": Object {
            "step": "1",
            "totalSteps": "1",
          },
          "_uuid": "27c4642c-7d64-44c1-98f0-f5853a45ec79",
          "currentState": "",
          "describe": "Write hi.mdx",
          "diff": "- Original  - 0
      + Modified  + 1

      + hello",
          "newState": "hello",
          "resourceDefinitions": Object {
            "content": "hello",
            "path": "hi.mdx",
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
          "_stepMetadata": Object {},
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
