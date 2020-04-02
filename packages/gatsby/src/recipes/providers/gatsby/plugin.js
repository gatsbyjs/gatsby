const fs = require(`fs`)
const path = require(`path`)
const babel = require(`@babel/core`)

const declare = require(`@babel/helper-plugin-utils`).declare

const isDefaultExport = node => {
  if (!node || node.type !== `MemberExpression`) {
    return false
  }

  const { object, property } = node

  if (object.type !== `Identifier` || object.name !== `module`) return false
  if (property.type !== `Identifier` || property.name !== `exports`)
    return false

  return true
}

const getValueFromLiteral = node => {
  if (node.type === 'StringLiteral') {
    return node.value
  }

  if (node.type === 'TemplateLiteral') {
    return node.quasis[0].value.raw
  }
}

const getNameForPlugin = node => {
  if (node.type === 'StringLiteral' || node.type === 'TemplateLiteral') {
    return getValueFromLiteral(node)
  }

  if (node.type === 'ObjectExpression') {
    const resolve = node.properties.find(p => p.key.name  === 'resolve')
    return resolve ? getValueFromLiteral(resolve.value) : null
  }
}

const addPluginToConfig = (src, pluginName) => {
  const addPlugins = new BabelPluginAddPluginsToGatsbyConfig({
    pluginOrThemeName: pluginName,
    shouldAdd: true,
  })

  const { code } = babel.transform(src, {
    plugins: [addPlugins.plugin],
  })

  return code
}

const getPluginsFromConfig = src => {
  const getPlugins = new BabelPluginGetPluginsFromGatsbyConfig()

  babel.transform(src, {
    plugins: [getPlugins.plugin],
  })

  return getPlugins.state
}

const create = ({ root }, { name }) => {
  const configPath = path.join(root, `gatsby-config.js`)
  const configSrc = fs.readFileSync(configPath)

  const code = addPluginToConfig(configSrc, name)

  fs.writeFileSync(configPath, code)
}

const read = ({ root }) => {
  const configPath = path.join(root, `gatsby-config.js`)
  const configSrc = fs.readFileSync(configPath)

  return getPluginsFromConfig(configSrc)
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
          ExpressionStatement(path) {
            const { node } = path
            const { left, right } = node.expression

            if (!isDefaultExport(left)) {
              return
            }

            const plugins = right.properties.find(p => p.key.name === `plugins`)

            if (shouldAdd) {
              const pluginNames = plugins.value.elements.map(getNameForPlugin)
              const exists = pluginNames.includes(node.value)
              if (!exists) {
                plugins.value.elements.push(t.stringLiteral(pluginOrThemeName))
              }
            } else {
              plugins.value.elements = plugins.value.elements.filter(
                node => node.value !== pluginOrThemeName
              )
            }

            path.stop()
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
          ExpressionStatement: path => {
            const { node } = path
            const { left, right } = node.expression

            if (!isDefaultExport(left)) {
              return
            }

            const plugins = right.properties.find(p => p.key.name === `plugins`)

            plugins.value.elements.map(node => {
              this.state.push(getNameForPlugin(node))
            })
          },
        },
      }
    })
  }
}

module.exports.addPluginToConfig = addPluginToConfig
module.exports.getPluginsFromConfig = getPluginsFromConfig

module.exports.create = create
module.exports.update = create
module.exports.read = read
module.exports.destroy = destroy
