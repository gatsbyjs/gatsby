const fs = require(`fs-extra`)
const path = require(`path`)
const babel = require(`@babel/core`)
const t = require(`@babel/types`)
const declare = require(`@babel/helper-plugin-utils`).declare
const Joi = require(`@hapi/joi`)
const glob = require(`glob`)
const prettier = require(`prettier`)
const resolveCwd = require(`resolve-cwd`)
const { slash } = require(`gatsby-core-utils`)

const getDiff = require(`../utils/get-diff`)
const resourceSchema = require(`../resource-schema`)

const isDefaultExport = require(`./utils/is-default-export`)
const buildPluginNode = require(`./utils/build-plugin-node`)
const getObjectFromNode = require(`./utils/get-object-from-node`)
const { getValueFromNode } = require(`./utils/get-object-from-node`)
const { REQUIRES_KEYS } = require(`./utils/constants`)

const { read: readPackageJSON } = require(`../npm/package`)

const fileExists = filePath => fs.existsSync(filePath)

const listShadowableFilesForTheme = (directory, theme) => {
  const themePath = path.dirname(resolveCwd(path.join(theme, `package.json`)))
  const themeSrcPath = path.join(themePath, `src`)
  const shadowableThemeFiles = glob.sync(themeSrcPath + `/**/*.*`, {
    follow: true,
  })

  const toShadowPath = filePath => {
    const relativeFilePath = slash(filePath).replace(slash(themeSrcPath), ``)
    return path.join(`src`, theme, relativeFilePath)
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

const getDescriptionForPlugin = async name => {
  const pkg = await readPackageJSON({}, name)

  return pkg ? pkg.description : null
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

const removePluginFromConfig = (src, { id, name, key }) => {
  const addPlugins = new BabelPluginAddPluginsToGatsbyConfig({
    pluginOrThemeName: name || id,
    key,
    shouldAdd: false,
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

const defaultConfig = `/**
 * Configure your Gatsby site with this file.
 *
 * See: https://www.gatsbyjs.org/docs/gatsby-config/
 */

module.exports = {
  plugins: [],
}`

const readConfigFile = async root => {
  let src
  try {
    src = await fs.readFile(getConfigPath(root), `utf8`)
  } catch (e) {
    if (e.code === `ENOENT`) {
      src = defaultConfig
    } else {
      throw e
    }
  }

  if (src === ``) {
    src = defaultConfig
  }

  return src
}

class MissingInfoError extends Error {
  constructor(foo = `bar`, ...params) {
    // Pass remaining arguments (including vendor specific ones) to parent constructor
    super(...params)

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, MissingInfoError)
    }

    this.name = `MissingInfoError`
    // Custom debugging information
    this.foo = foo
    this.date = new Date()
  }
}

const create = async ({ root }, { name, options, key }) => {
  // TODO generalize this — it's for the demo.
  if (options?.accessToken === `(Known after install)`) {
    throw new MissingInfoError({ name, options, key })
  }
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
      const description = await getDescriptionForPlugin(id)
      const { shadowedFiles, shadowableFiles } = listShadowableFilesForTheme(
        root,
        plugin.name
      )

      return {
        id,
        description: description || null,
        ...plugin,
        shadowedFiles,
        shadowableFiles,
        _message: `Installed ${id} in gatsby-config.js`,
      }
    } else {
      return undefined
    }
  } catch (e) {
    console.log(e)
    throw e
  }
}

const destroy = async ({ root }, resource) => {
  const configSrc = await readConfigFile(root)

  const newSrc = removePluginFromConfig(configSrc, resource)

  await fs.writeFile(getConfigPath(root), newSrc)
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
                    return plugin.key !== key
                  }

                  return plugin.name !== pluginOrThemeName
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
module.exports.removePluginFromConfig = removePluginFromConfig

module.exports.create = create
module.exports.update = create
module.exports.read = read
module.exports.destroy = destroy
module.exports.config = {}

module.exports.all = async ({ root }) => {
  const configSrc = await readConfigFile(root)
  const plugins = getPluginsFromConfig(configSrc)

  return Promise.all(plugins.map(({ name }) => read({ root }, name)))
}

const schema = {
  name: Joi.string(),
  description: Joi.string().optional().allow(null).allow(``),
  options: Joi.object(),
  shadowableFiles: Joi.array().items(Joi.string()),
  shadowedFiles: Joi.array().items(Joi.string()),
  ...resourceSchema,
}

const validate = resource => {
  if (REQUIRES_KEYS.includes(resource.name) && !resource._key) {
    return {
      error: `${resource.name} requires a key to be set`,
    }
  }

  if (resource._key && resource._key === resource.name) {
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
