const fs = require(`fs`)
const path = require(`path`)

const { addPluginToConfig, getPluginsFromConfig } = require(`./plugin`)

const CONFIG_PATH = path.join(__dirname, `./fixtures/gatsby-config.js`)

test(`adds a plugin to a gatsby config`, () => {
  const src = fs.readFileSync(CONFIG_PATH, `utf8`)

  const result = addPluginToConfig(src, `gatsby-plugin-foo`)

  expect(getPluginsFromConfig(result)).toContain(`gatsby-plugin-foo`)
})

test(`retrieves plugins from a config`, () => {
  const src = fs.readFileSync(CONFIG_PATH, `utf8`)

  const result = getPluginsFromConfig(src)

  expect(result).toEqual([
    `gatsby-source-filesystem`,
    `gatsby-transformer-sharp`,
    `gatsby-plugin-emotion`,
    `gatsby-plugin-typography`,
    `gatsby-transformer-remark`,
    `gatsby-plugin-sharp`,
    `gatsby-plugin-google-analytics`,
    `gatsby-plugin-manifest`,
    `gatsby-plugin-offline`,
    `gatsby-plugin-react-helmet`,
  ])
})
