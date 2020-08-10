const fs = require(`fs-extra`)
const path = require(`path`)
const tmp = require(`tmp-promise`)

const plugin = require(`./plugin`)
const {
  addPluginToConfig,
  getPluginsFromConfig,
  removePluginFromConfig,
} = require(`./plugin`)
const resourceTestHelper = require(`../resource-test-helper`)

const STARTER_BLOG_FIXTURE = path.join(
  __dirname,
  `./fixtures/gatsby-starter-blog`
)
const HELLO_WORLD_FIXTURE = path.join(
  __dirname,
  `./fixtures/gatsby-starter-hello-world`
)
const name = `gatsby-source-filesystem`

describe(`gatsby-plugin resource`, () => {
  let tmpDir
  let starterBlogRoot
  let helloWorldRoot
  let configPath
  let emptyRoot
  beforeAll(async () => {
    tmpDir = await tmp.dir({
      unsafeCleanup: true,
    })
    starterBlogRoot = path.join(tmpDir.path, `gatsby-starter-blog`)
    helloWorldRoot = path.join(tmpDir.path, `gatsby-starter-hello-world`)
    configPath = path.join(helloWorldRoot, `gatsby-config.js`)
    emptyRoot = path.join(tmpDir.path, `empty-site-directory`)
    await fs.ensureDir(emptyRoot)
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

  test(`all returns plugins as array`, async () => {
    const result = await plugin.all({ root: STARTER_BLOG_FIXTURE })

    expect(result).toMatchSnapshot()
  })

  test(`does not add the same plugin twice by default`, async () => {
    const configSrc = await fs.readFile(configPath, `utf8`)
    let newConfigSrc = addPluginToConfig(configSrc, {
      name: `gatsby-plugin-react-helmet`,
    })
    newConfigSrc = addPluginToConfig(newConfigSrc, {
      name: `gatsby-plugin-foo`,
    })
    newConfigSrc = addPluginToConfig(newConfigSrc, {
      name: `gatsby-plugin-mdx`,
    })
    const plugins = getPluginsFromConfig(newConfigSrc)
    const plugins1 = [...new Set(plugins)]

    newConfigSrc = addPluginToConfig(newConfigSrc, {
      name: `gatsby-plugin-react-helmet`,
    })

    const plugins2 = getPluginsFromConfig(newConfigSrc)

    expect(plugins1).toEqual(plugins2)
  })

  test(`removes plugins by name and key`, async () => {
    let configSrc = await fs.readFile(configPath, `utf8`)
    configSrc = addPluginToConfig(configSrc, { name: `gatsby-plugin-foo` })
    configSrc = addPluginToConfig(configSrc, {
      name: `gatsby-plugin-bar`,
      options: { hello: `world` },
    })
    configSrc = addPluginToConfig(configSrc, {
      name: `gatsby-plugin-baz`,
      key: `special-key`,
    })

    configSrc = removePluginFromConfig(configSrc, { key: `special-key` })

    let plugins = await getPluginsFromConfig(configSrc)

    let pluginNames = plugins.map(p => p.name)
    expect(pluginNames).toContain(`gatsby-plugin-foo`)
    expect(pluginNames).toContain(`gatsby-plugin-bar`)
    expect(pluginNames).not.toContain(`gatsby-plugin-baz`)

    configSrc = removePluginFromConfig(configSrc, { id: `gatsby-plugin-bar` })

    plugins = await getPluginsFromConfig(configSrc)

    pluginNames = plugins.map(p => p.name)
    expect(pluginNames).not.toContain(`gatsby-plugin-baz`)
    expect(pluginNames).not.toContain(`gatsby-plugin-bar`)
    expect(pluginNames).toContain(`gatsby-plugin-foo`)
  })

  // A key isn't required for gatsby plugin, but when you want to distinguish
  // between multiple of the same plugin, you can specify it to target config changes.
  test(`validates the gatsby-source-filesystem specifies a key`, async () => {
    const result = plugin.validate({ name: `gatsby-source-filesystem` })

    expect(result.error).toEqual(
      `gatsby-source-filesystem requires a key to be set`
    )
  })

  test(`validates the gatsby-source-filesystem specifies a key that isn't equal to the name`, async () => {
    const result = plugin.validate({
      name: `gatsby-source-filesystem`,
      _key: `gatsby-source-filesystem`,
    })

    expect(result.error).toEqual(
      `gatsby-source-filesystem requires a key to be different than the plugin name`
    )
  })

  test(`adds multiple gatsby-source-filesystems and reads with key`, async () => {
    const context = { root: helloWorldRoot }
    const fooPlugin = {
      key: `foo-data-sourcing`,
      name: `gatsby-source-filesystem`,
      options: {
        name: `foo`,
        path: `foo`,
      },
    }
    const barPlugin = {
      key: `bar-data-sourcing`,
      name: `gatsby-source-filesystem`,
      options: {
        name: `bar`,
        path: `bar`,
      },
    }

    await plugin.create(context, fooPlugin)
    await plugin.create(context, barPlugin)

    const barResult = await plugin.read(context, barPlugin.key)
    const fooResult = await plugin.read(context, fooPlugin.key)

    expect(barResult.key).toEqual(barPlugin.key)
    expect(fooResult.key).toEqual(fooPlugin.key)
    expect(barResult.options.name).toEqual(barPlugin.options.name)
    expect(fooResult.options.name).toEqual(fooPlugin.options.name)

    const newBarResult = await plugin.update(context, {
      ...barResult,
      options: { path: `new-bar` },
    })

    expect(newBarResult.key).toEqual(barPlugin.key)
    expect(newBarResult.options).toEqual({ path: `new-bar` })

    await plugin.destroy(context, barResult)
    await plugin.destroy(context, fooResult)
  })

  test(`handles config options as an object`, async () => {
    const configSrc = await fs.readFile(configPath, `utf8`)
    const newConfigSrc = addPluginToConfig(configSrc, {
      name: `gatsby-source-filesystem`,
      options: {
        foo: 1,
        bar: `baz`,
        baz: `qux`,
        otherStuff: [
          {
            foo: `bar2`,
            bar: [{ foo: `bar` }],
          },
        ],
      },
    })

    const result = getPluginsFromConfig(newConfigSrc)

    expect(result).toMatchSnapshot()
  })

  test(`creates default gatsby-config.js if there isn't one already`, async () => {
    const result = await plugin.create(
      { root: emptyRoot },
      { name: `gatsby-source-filesystem` }
    )
    expect(result).toMatchSnapshot()
  })
})
