const directory = require(`./directory`)
const resourceTestHelper = require(`../resource-test-helper`)

const root = __dirname

describe(`directory resource`, () => {
  test(`e2e directory resource test`, async () => {
    await resourceTestHelper({
      resourceModule: directory,
      resourceName: `Directory`,
      context: { root },
      initialObject: { path: `directory` },
      partialUpdate: { path: `directory1` },
    })
  })
})
