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
    const { stepsAsMdx, exportsAsMdx } = await parse(mdxFixture)
    const result = await render([...stepsAsMdx, ...exportsAsMdx].join(`\n`))

    // Gatsby latest version is ever changing so we use regex matcher for currentState property.
    // Unfortunately jest property matchers work weirdly on arrays so instead
    // of snapshotting entitre result array it's split into few pieces.

    expect(result.length).toEqual(3)
    delete result[0]._uuid
    delete result[1]._uuid
    delete result[2]._uuid
    expect(result[0]).toMatchInlineSnapshot(`
      Object {
        "_stepMetadata": Object {
          "step": "1",
          "totalSteps": "1",
        },
        "_type": "File",
        "currentState": "",
        "describe": "Write foo.js",
        "diff": "- Original  - 0
      + Modified  + 1

      + hiiiiii!",
        "newState": "hiiiiii!",
        "resourceDefinitions": Object {
          "content": "hiiiiii!",
          "mdxType": "File",
          "path": "foo.js",
        },
        "resourceName": "File",
      }
    `)
    expect(result[1]).toMatchInlineSnapshot(`
      Object {
        "_stepMetadata": Object {
          "step": "1",
          "totalSteps": "1",
        },
        "_type": "File",
        "currentState": "",
        "describe": "Write foo2.js",
        "diff": "- Original  - 0
      + Modified  + 1

      + /** foo2 */",
        "newState": "/** foo2 */",
        "resourceDefinitions": Object {
          "content": "/** foo2 */",
          "mdxType": "File",
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
        "_stepMetadata": Object {
          "step": "1",
          "totalSteps": "1",
        },
        "_type": "NPMPackage",
        "currentState": StringMatching /gatsby@\\[0-9\\.\\]\\+/,
        "describe": "Install gatsby@latest",
        "newState": "gatsby@latest",
        "resourceDefinitions": Object {
          "mdxType": "NPMPackage",
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
            "mdxType": "File",
            "path": "hi.md",
          },
          "resourceName": "File",
        },
      ]
    `)
  })

  test(`handles exports and allows them to be used as local variables`, async () => {
    const { stepsAsMdx, exportsAsMdx } = await parse(`
# Hello, world!

---

export const myVar = 'hi.mdx'

<File path={myVar} content="hello" />
    `)

    const result = await render([...stepsAsMdx, ...exportsAsMdx].join(`\n`))
    result.forEach(r => delete r._uuid)

    expect(result).toMatchInlineSnapshot(`
      Array [
        Object {
          "_stepMetadata": Object {
            "step": "1",
            "totalSteps": "1",
          },
          "_type": "File",
          "currentState": "",
          "describe": "Write hi.mdx",
          "diff": "- Original  - 0
      + Modified  + 1

      + hello",
          "newState": "hello",
          "resourceDefinitions": Object {
            "content": "hello",
            "mdxType": "File",
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
            "mdxType": "File",
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
