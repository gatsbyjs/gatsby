const fs = require(`fs-extra`)
const path = require(`path`)
const babel = require(`@babel/core`)
const t = require(`@babel/types`)
const declare = require(`@babel/helper-plugin-utils`).declare
const Joi = require(`@hapi/joi`)
const glob = require(`glob`)
const prettier = require(`prettier`)

const getDiff = require(`../utils/get-diff`)
const resourceSchema = require(`../resource-schema`)

const isDefaultExport = require(`./utils/is-default-export`)
const buildPluginNode = require(`./utils/build-plugin-node`)
const getObjectFromNode = require(`./utils/get-object-from-node`)
const { getValueFromNode } = require(`./utils/get-object-from-node`)
const { REQUIRES_KEYS } = require(`./utils/constants`)

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

const getOptionsForPlugin = node => {
  if (!t.isObjectExpression(node)) {
    return undefined
  }

  const options = node.properties.find(
    property => property.key.name === `options`
  )

  if (options) {
    return getObjectFromNode(options.value)
  }

  return undefined
}

const getPlugin = node => {
  const plugin = {
    name: getNameForPlugin(node),
    options: getOptionsForPlugin(node),
  }

  const key = getKeyForPlugin(node)

  if (key) {
    return { ...plugin, key }
  }

  return plugin
}

const getKeyForPlugin = node => {
  if (t.isObjectExpression(node)) {
    const key = node.properties.find(p => p.key.name === `__key`)

    return key ? getValueFromNode(key.value) : null
  }

  return null
}

const getNameForPlugin = node => {
  if (t.isStringLiteral(node) || t.isTemplateLiteral(node)) {
    return getValueFromNode(node)
  }

  if (t.isObjectExpression(node)) {
    const resolve = node.properties.find(p => p.key.name === `resolve`)

    return resolve ? getValueFromNode(resolve.value) : null
  }

  return null
}

const addPluginToConfig = (src, { name, options, key }) => {
  const addPlugins = new BabelPluginAddPluginsToGatsbyConfig({
    pluginOrThemeName: name,
    options,
    shouldAdd: true,
    key,
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

const getConfigPath = root => path.join(root, `gatsby-config.js`)

const readConfigFile = async root => {
  let src
  try {
    src = await fs.readFile(getConfigPath(root), `utf8`)
  } catch (e) {
    if (e.code === `ENOENT`) {
      src = `/**
 * Configure your Gatsby site with this file.
 *
 * See: https://www.gatsbyjs.org/docs/gatsby-config/
 */

module.exports = {
  plugins: [],
}`
    } else {
      throw e
    }
  }

  return src
}

const create = async ({ root }, { name, options, key }) => {
  const configSrc = await readConfigFile(root)
  const prettierConfig = await prettier.resolveConfig(root)

  let code = addPluginToConfig(configSrc, { name, options, key })
  code = prettier.format(code, { ...prettierConfig, parser: `babel` })

  await fs.writeFile(getConfigPath(root), code)

  return await read({ root }, key || name)
}

const read = async ({ root }, id) => {
  try {
    const configSrc = await readConfigFile(root)

    const plugin = getPluginsFromConfig(configSrc).find(
      plugin => plugin.key === id || plugin.name === id
    )

    if (plugin) {
      return { id, ...plugin, _message: `Installed ${id} in gatsby-config.js` }
    } else {
      return undefined
    }
  } catch (e) {
    console.log(e)
    throw e
  }
}

const destroy = async ({ root }, { id, name }) => {
  const configSrc = await readConfigFile(root)

  const addPlugins = new BabelPluginAddPluginsToGatsbyConfig({
    pluginOrThemeName: name,
    key: id,
    shouldAdd: false,
  })

  const { code } = babel.transform(configSrc, {
    plugins: [addPlugins.plugin],
    configFile: false,
  })

  await fs.writeFile(getConfigPath(root), code)
}

class BabelPluginAddPluginsToGatsbyConfig {
  constructor({ pluginOrThemeName, shouldAdd, options, key }) {
    this.plugin = declare(api => {
      api.assertVersion(7)

      return {
        visitor: {
          ExpressionStatement(path) {
            const { node } = path
            const { left, right } = node.expression

            if (!isDefaultExport(left)) {
              return
            }

            const pluginNodes = right.properties.find(
              p => p.key.name === `plugins`
            )

            if (shouldAdd) {
              const plugins = pluginNodes.value.elements.map(getPlugin)
              const matches = plugins.filter(plugin => {
                if (!key) {
                  return plugin.name === pluginOrThemeName
                }

                return plugin.key === key
              })

              if (!matches.length) {
                const pluginNode = buildPluginNode({
                  name: pluginOrThemeName,
                  options,
                  key,
                })

                pluginNodes.value.elements.push(pluginNode)
              } else {
                pluginNodes.value.elements = pluginNodes.value.elements.map(
                  node => {
                    const plugin = getPlugin(node)

                    if (plugin.key !== key) {
                      return node
                    }

                    if (!plugin.key && plugin.name !== pluginOrThemeName) {
                      return node
                    }

                    return buildPluginNode({
                      name: pluginOrThemeName,
                      options,
                      key,
                    })
                  }
                )
              }
            } else {
              pluginNodes.value.elements = pluginNodes.value.elements.filter(
                node => {
                  const plugin = getPlugin(node)
                  if (key) {
                    return plugin.key === key
                  }

                  return plugin.name === pluginOrThemeName
                }
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
              this.state.push(getPlugin(node))
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
  const configSrc = await readConfigFile(root)
  const plugins = getPluginsFromConfig(configSrc)

  // TODO: Consider mapping to read function
  return plugins.map(plugin => {
    const { shadowedFiles, shadowableFiles } = listShadowableFilesForTheme(
      root,
      plugin.name
    )

    return {
      id: plugin.name,
      ...plugin,
      shadowedFiles,
      shadowableFiles,
    }
  })
}

const schema = {
  name: Joi.string(),
  options: Joi.object(),
  shadowableFiles: Joi.array().items(Joi.string()),
  shadowedFiles: Joi.array().items(Joi.string()),
  ...resourceSchema,
}

const validate = resource => {
  if (REQUIRES_KEYS.includes(resource.name) && !resource.key) {
    return {
      error: `${resource.name} requires a key to be set`,
    }
  }

  if (resource.key && resource.key === resource.name) {
    return {
      error: `${resource.name} requires a key to be different than the plugin name`,
    }
  }

  return Joi.validate(resource, schema, { abortEarly: false })
}

exports.schema = schema
exports.validate = validate

module.exports.plan = async ({ root }, { id, key, name, options }) => {
  const fullName = id || name
  const prettierConfig = await prettier.resolveConfig(root)
  let configSrc = await readConfigFile(root)
  configSrc = prettier.format(configSrc, {
    ...prettierConfig,
    parser: `babel`,
  })

  let newContents = addPluginToConfig(configSrc, {
    id,
    key: id || key,
    name: fullName,
    options,
  })
  newContents = prettier.format(newContents, {
    ...prettierConfig,
    parser: `babel`,
  })
  const diff = await getDiff(configSrc, newContents)

  return {
    id: fullName,
    name,
    diff,
    currentState: configSrc,
    newState: newContents,
    describe: `Install ${fullName} in gatsby-config.js`,
  }
}
