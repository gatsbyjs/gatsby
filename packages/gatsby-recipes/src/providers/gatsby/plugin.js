const fs = require(`fs-extra`)
const path = require(`path`)
const babel = require(`@babel/core`)
const Joi = require(`@hapi/joi`)
const glob = require(`glob`)
const prettier = require(`prettier`)

const declare = require(`@babel/helper-plugin-utils`).declare

const getDiff = require(`../utils/get-diff`)
const resourceSchema = require(`../resource-schema`)
const fileExists = filePath => fs.existsSync(filePath)

const listShadowableFilesForTheme = (directory, theme) => {
  const fullThemePath = path.join(directory, `node_modules`, theme, `src`)
  const shadowableThemeFiles = glob.sync(fullThemePath + `/**/*.*`, {
    follow: true,
  })

  const toShadowPath = filePath => {
    const themePath = filePath.replace(fullThemePath, ``)
    return path.join(`src`, theme, themePath)
  }

  const shadowPaths = shadowableThemeFiles.map(toShadowPath)

  const shadowedFiles = shadowPaths.filter(fileExists)
  const shadowableFiles = shadowPaths.filter(filePath => !fileExists(filePath))

  return { shadowedFiles, shadowableFiles }
}

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
    configFile: false,
  })

  return code
}

const getPluginsFromConfig = src => {
  const getPlugins = new BabelPluginGetPluginsFromGatsbyConfig()

  babel.transform(src, {
    plugins: [getPlugins.plugin],
    configFile: false,
  })

  return getPlugins.state
}

const create = async ({ root }, { name }) => {
  const configPath = path.join(root, `gatsby-config.js`)
  const configSrc = await fs.readFile(configPath, `utf8`)

  const prettierConfig = await prettier.resolveConfig(root)

  let code = addPluginToConfig(configSrc, name)
  code = prettier.format(code, { ...prettierConfig, parser: `babel` })

  await fs.writeFile(configPath, code)

  return await read({ root }, name)
}

const read = async ({ root }, id) => {
  const configPath = path.join(root, `gatsby-config.js`)
  const configSrc = await fs.readFile(configPath, `utf8`)

  const name = getPluginsFromConfig(configSrc).find(name => name === id)

  if (name) {
    return { id, name, _message: `Installed ${id} in gatsby-config.js` }
  } else {
    return undefined
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
    configFile: false,
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
module.exports.config = {}

module.exports.all = async ({ root }) => {
  const configPath = path.join(root, `gatsby-config.js`)
  const src = await fs.readFile(configPath, `utf8`)
  const plugins = getPluginsFromConfig(src)

  // TODO: Consider mapping to read function
  return plugins.map(name => {
    const { shadowedFiles, shadowableFiles } = listShadowableFilesForTheme(
      root,
      name
    )

    return {
      id: name,
      name,
      shadowedFiles,
      shadowableFiles,
    }
  })
}

const schema = {
  name: Joi.string(),
  shadowableFiles: Joi.array().items(Joi.string()),
  shadowedFiles: Joi.array().items(Joi.string()),
  ...resourceSchema,
}

const validate = resource =>
  Joi.validate(resource, schema, { abortEarly: false })

exports.schema = schema
exports.validate = validate

module.exports.plan = async ({ root }, { id, name }) => {
  const fullName = id || name
  const configPath = path.join(root, `gatsby-config.js`)
  const prettierConfig = await prettier.resolveConfig(root)
  let src = await fs.readFile(configPath, `utf8`)
  src = prettier.format(src, {
    ...prettierConfig,
    parser: `babel`,
  })
  let newContents = addPluginToConfig(src, fullName)
  newContents = prettier.format(newContents, {
    ...prettierConfig,
    parser: `babel`,
  })
  const diff = await getDiff(src, newContents)

  return {
    id: fullName,
    name,
    diff,
    currentState: src,
    newState: newContents,
    describe: `Install ${fullName} in gatsby-config.js`,
  }
}
