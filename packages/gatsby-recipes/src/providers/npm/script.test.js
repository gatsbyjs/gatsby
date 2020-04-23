const path = require(`path`)

const script = require(`./script`)
const resourceTestHelper = require(`../resource-test-helper`)

const root = path.join(__dirname, `fixtures`)

describe(`npm script resource`, () => {
  test(`e2e script resource test`, async () => {
    await resourceTestHelper({
      resourceModule: script,
      resourceName: `NPMScript`,
      context: { root },
      initialObject: { name: `apple`, command: `foot` },
      partialUpdate: { command: `foot2` },
    })
  })
})
