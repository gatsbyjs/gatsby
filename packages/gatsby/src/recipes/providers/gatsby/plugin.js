const fs = require(`fs-extra`)
const path = require(`path`)
const babel = require(`@babel/core`)
const Joi = require(`@hapi/joi`)

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
  if (node.type === `StringLiteral`) {
    return node.value
  }

  if (node.type === `TemplateLiteral`) {
    return node.quasis[0].value.raw
  }

  return null
}

const getNameForPlugin = node => {
  if (node.type === `StringLiteral` || node.type === `TemplateLiteral`) {
    return getValueFromLiteral(node)
  }

  if (node.type === `ObjectExpression`) {
    const resolve = node.properties.find(p => p.key.name === `resolve`)
    return resolve ? getValueFromLiteral(resolve.value) : null
  }

  return null
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

const create = async ({ root }, { name }) => {
  const configPath = path.join(root, `gatsby-config.js`)
  const configSrc = await fs.readFile(configPath, `utf8`)

  const code = addPluginToConfig(configSrc, name)

  await fs.writeFile(configPath, code)

  return { id: name, name }
}

const read = async ({ root }, id) => {
  const configPath = path.join(root, `gatsby-config.js`)
  const configSrc = await fs.readFile(configPath, `utf8`)

  const name = getPluginsFromConfig(configSrc).find(name => name === id)

  if (name) {
    return { id, name }
  } else {
    return null
  }
}

const destroy = async ({ root }, { name }) => {
  const configPath = path.join(root, `gatsby-config.js`)
  const configSrc = await fs.readFile(configPath, `utf8`)

  const addPlugins = new BabelPluginAddPluginsToGatsbyConfig({
    pluginOrThemeName: name,
    shouldAdd: false,
  })

  const { code } = babel.transform(configSrc, {
    plugins: [addPlugins.plugin],
  })

  await fs.writeFile(configPath, code)
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
              const exists = pluginNames.includes(pluginOrThemeName)
              if (!exists) {
                plugins.value.elements.push(t.stringLiteral(pluginOrThemeName))
              }
            } else {
              plugins.value.elements = plugins.value.elements.filter(
                node => getNameForPlugin(node) !== pluginOrThemeName
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

module.exports.validate = () => {
  return {
    name: Joi.string(),
  }
}

module.exports.plan = async ({ root }, { id, name }) => {
  const fullName = id || name
  const configPath = path.join(root, `gatsby-config.js`)
  const src = await fs.readFile(configPath, `utf8`)
  const newContents = addPluginToConfig(src, fullName)

  return {
    id: fullName,
    name,
    currentState: src,
    newState: newContents,
    describe: `Configure ${fullName}`,
  }
}
