const path = require(`path`)
const rimraf = require(`rimraf`)

const shadowFile = require(`./shadow-file`)
const resourceTestHelper = require(`../resource-test-helper`)

const root = path.join(__dirname, `fixtures`)

const cleanup = () => {
  rimraf.sync(path.join(root, `src`))
}

beforeEach(() => {
  cleanup()
})

afterEach(() => {
  cleanup()
})

describe(`Shadow File resource`, () => {
  test(`e2e shadow file resource test`, async () => {
    await resourceTestHelper({
      resourceModule: shadowFile,
      resourceName: `GatsbyShadowFile`,
      context: { root },
      initialObject: {
        theme: `gatsby-theme-blog`,
        path: `src/components/author.js`,
      },
      partialUpdate: {
        theme: `gatsby-theme-blog`,
        path: `src/components/author.js`,
      },
    })
  })
})
