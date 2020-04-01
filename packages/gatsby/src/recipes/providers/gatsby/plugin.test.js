const fs = require(`fs`)
const path = require(`path`)

const { addPluginToConfig } = require(`./plugin`)

const CONFIG_PATH = path.join(__dirname, `./fixtures/gatsby-config.js`)

test(`babel plugin to get list of plugins and their options!`, () => {
  const src = fs.readFileSync(CONFIG_PATH, `utf8`)

  const result = addPluginToConfig(src, `gatsby-plugin-foo`)

  expect(result).toMatch(`gatsby-plugin-foo`)
})
