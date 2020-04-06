const fs = require(`fs-extra`)
const path = require(`path`)

const plugin = require(`./plugin`)
const { addPluginToConfig, getPluginsFromConfig } = require(`./plugin`)
const resourceTestHelper = require(`../resource-test-helper`)

const root = path.join(__dirname, `./fixtures`)
const name = `gatsby-plugin-foo`
const configPath = path.join(root, `gatsby-config.js`)

describe(`gatsby-plugin resource`, () => {
  test(`e2e file resource test`, async () => {
    await resourceTestHelper({
      resourceModule: plugin,
      resourceName: `File`,
      context: { root },
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
