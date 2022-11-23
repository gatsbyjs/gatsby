const path = require(`path`)
const ignore = require(`./ignore`)
const resourceTestHelper = require(`../resource-test-helper`)

const root = path.join(__dirname, `fixtures`)

describe(`git ignore resource`, () => {
  test(`e2e test`, async () => {
    await resourceTestHelper({
      resourceModule: ignore,
      resourceName: `GitIgnore`,
      context: { root },
      initialObject: { name: `.cache` },
      partialUpdate: { id: `.cache`, name: `.cache` },
    })
  })

  test(`does not add duplicate entries`, async () => {
    const name = `node_modules`

    await ignore.create({ root }, { name })

    const result = await ignore.all({ root })

    expect(result).toMatchInlineSnapshot(`
      Array [
        Object {
          "id": "node_modules",
          "name": "node_modules",
        },
      ]
    `)
  })
})
