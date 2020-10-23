const fs = require(`fs-extra`)
const path = require(`path`)
const tmp = require(`tmp-promise`)

const plugin = require(`./site-metadata`)

jest.mock(`node-fetch`, () => require(`fetch-mock-jest`).sandbox())
const { mockReadmeLoader } = require(`../../test-helper`)
mockReadmeLoader()
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

  test(`handles multiple parallel create calls`, async () => {
    const root = starterBlogRoot
    const resultPromise = plugin.create(
      {
        root,
      },
      {
        name: `husky`,
        value: `hi`,
      }
    )
    const result2Promise = plugin.create(
      {
        root,
      },
      {
        name: `husky2`,
        value: `hi`,
      }
    )

    const result = await resultPromise
    const result2 = await result2Promise

    expect(result).toMatchSnapshot()
    expect(result2).toMatchSnapshot()

    await plugin.destroy({ root }, result)
    await plugin.destroy({ root }, result2)
  })
})
