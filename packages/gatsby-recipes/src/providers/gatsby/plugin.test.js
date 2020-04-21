const fs = require(`fs-extra`)
const path = require(`path`)
const tmp = require(`tmp-promise`)

const plugin = require(`./plugin`)
const { addPluginToConfig, getPluginsFromConfig } = require(`./plugin`)
const resourceTestHelper = require(`../resource-test-helper`)

const STARTER_BLOG_FIXTURE = path.join(
  __dirname,
  `./fixtures/gatsby-starter-blog`
)
const HELLO_WORLD_FIXTURE = path.join(
  __dirname,
  `./fixtures/gatsby-starter-hello-world`
)
const name = `gatsby-plugin-foo`

describe(`gatsby-plugin resource`, () => {
  let tmpDir
  let starterBlogRoot
  let helloWorldRoot
  let configPath
  beforeAll(async () => {
    tmpDir = await tmp.dir({
      unsafeCleanup: true,
    })
    starterBlogRoot = path.join(tmpDir.path, `gatsby-starter-blog`)
    helloWorldRoot = path.join(tmpDir.path, `gatsby-starter-hello-world`)
    configPath = path.join(helloWorldRoot, `gatsby-config.js`)
    await fs.ensureDir(starterBlogRoot)
    await fs.copy(STARTER_BLOG_FIXTURE, starterBlogRoot)
    await fs.ensureDir(helloWorldRoot)
    await fs.copy(HELLO_WORLD_FIXTURE, helloWorldRoot)
  })
  afterAll(async () => {
    if (tmpDir) {
      await tmpDir.cleanup()
    }
  })

  test(`e2e plugin resource test`, async () => {
    await resourceTestHelper({
      resourceModule: plugin,
      resourceName: `GatsbyPlugin`,
      context: { root: starterBlogRoot },
      initialObject: { id: name, name },
      partialUpdate: { id: name },
    })
  })

  test(`e2e plugin resource test with hello world starter`, async () => {
    await resourceTestHelper({
      resourceModule: plugin,
      resourceName: `GatsbyPlugin`,
      context: { root: helloWorldRoot },
      initialObject: { id: name, name },
      partialUpdate: { id: name },
    })
  })

  test(`does not add the same plugin twice by default`, async () => {
    const configSrc = await fs.readFile(configPath, `utf8`)
    const newConfigSrc = addPluginToConfig(
      configSrc,
      `gatsby-plugin-react-helmet`
    )
    const plugins = getPluginsFromConfig(newConfigSrc)

    const result = [...new Set(plugins)]

    expect(result).toEqual(plugins)
  })
})
