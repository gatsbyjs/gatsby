const fs = require(`fs-extra`)
const path = require(`path`)
const tmp = require(`tmp-promise`)

const plugin = require(`./site-metadata`)
const resourceTestHelper = require(`../resource-test-helper`)

const STARTER_BLOG_FIXTURE = path.join(
  __dirname,
  `./fixtures/gatsby-starter-blog`
)

describe(`gatsby-plugin resource`, () => {
  let tmpDir
  let starterBlogRoot
  let emptyRoot
  beforeAll(async () => {
    tmpDir = await tmp.dir({
      unsafeCleanup: true,
    })
    starterBlogRoot = path.join(tmpDir.path, `gatsby-starter-blog`)
    emptyRoot = path.join(tmpDir.path, `empty-site-directory`)
    await fs.ensureDir(emptyRoot)
    await fs.ensureDir(starterBlogRoot)
    await fs.copy(STARTER_BLOG_FIXTURE, starterBlogRoot)
  })
  afterAll(async () => {
    if (tmpDir) {
      await tmpDir.cleanup()
    }
  })

  test(`e2e plugin resource test`, async () => {
    await resourceTestHelper({
      resourceModule: plugin,
      resourceName: `GatsbySiteMetadata`,
      context: { root: starterBlogRoot },
      initialObject: { name: `author`, value: `Fred` },
      partialUpdate: { name: `author`, value: `Velma` },
    })
  })
})
