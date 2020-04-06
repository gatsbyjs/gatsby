const file = require(`./file`)
const resourceTestHelper = require(`../resource-test-helper`)

const root = __dirname
const content = `Hello, world!`

describe(`file resource`, () => {
  test(`e2e file resource test`, async () => {
    await resourceTestHelper({
      resourceModule: file,
      resourceName: `File`,
      context: { root },
      initialObject: { path: `file.txt`, content },
      partialUpdate: { content: content + `1` },
    })
  })
})
