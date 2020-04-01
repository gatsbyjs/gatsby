const fs = require(`fs`)
const path = require(`path`)
const babel = require(`@babel/core`)

const declare = require(`@babel/helper-plugin-utils`).declare

const create = ({ root }, { name }) => {
  const configPath = path.join(root, `gatsby-config.js`)
  const configSrc = fs.readFileSync(configPath)
  console.log({ configPath, configSrc })

  const addPlugins = new BabelPluginAddPluginsToGatsbyConfig({
    pluginOrThemeName: name,
    shouldAdd: true,
  })

  const { code } = babel.transform(configSrc, {
    plugins: [addPlugins.plugin],
  })

  fs.writeFileSync(configPath, code)
}

const read = ({ root }) => {
  const configPath = path.join(root, `gatsby-config.js`)
  const configSrc = fs.readFileSync(configPath)

  const getPlugins = new BabelPluginGetPluginsFromGatsbyConfig()

  babel.transform(configSrc, {
    plugins: [getPlugins.plugin],
  })

  return getPlugins.state
}

const destroy = ({ root }, { name }) => {
  const configPath = path.join(root, `gatsby-config.js`)
  const configSrc = fs.readFileSync(configPath)

  const addPlugins = new BabelPluginAddPluginsToGatsbyConfig({
    pluginOrThemeName: name,
    shouldAdd: false,
  })

  const { code } = babel.transform(configSrc, {
    plugins: [addPlugins.plugin],
  })

  fs.writeFileSync(configPath, code)
}

class BabelPluginAddPluginsToGatsbyConfig {
  constructor({ pluginOrThemeName, shouldAdd }) {
    this.plugin = declare(api => {
      api.assertVersion(7)

      const { types: t } = api
      return {
        visitor: {
          Program({ node }) {
            console.log(node.body[0].expression)
            const plugins = node.body[0].expression.right.properties.find(
              p => p.key.name === `plugins`
            )
            if (shouldAdd) {
              const exists = plugins.value.elements.some(
                node => node.value === pluginOrThemeName
              )
              if (!exists) {
                plugins.value.elements.push(t.stringLiteral(pluginOrThemeName))
              }
            } else {
              plugins.value.elements = plugins.value.elements.filter(
                node => node.value !== pluginOrThemeName
              )
            }
          },
        },
      }
    })
  }
}

class BabelPluginGetPluginsFromGatsbyConfig {
  constructor() {
    this.state = []

    this.plugin = declare(api => {
      api.assertVersion(7)

      return {
        visitor: {
          Program: ({ node }) => {
            const plugins = node.body[0].expression.right.properties.find(
              p => p.key.name === `plugins`
            )
            plugins.value.elements.forEach(node => {
              // TODO: handle { resolve: 'thing' }
              this.state.push(node.value)
            })
          },
        },
      }
    })
  }
}

module.exports.create = create
module.exports.update = create
module.exports.read = read
module.exports.destroy = destroy
