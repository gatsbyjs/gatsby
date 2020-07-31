const fs = require(`fs-extra`)
const path = require(`path`)
const babel = require(`@babel/core`)
const declare = require(`@babel/helper-plugin-utils`).declare
const Joi = require(`@hapi/joi`)
const prettier = require(`prettier`)

const getDiff = require(`../utils/get-diff`)
const resourceSchema = require(`../resource-schema`)

const isDefaultExport = require(`./utils/is-default-export`)
const buildPluginNode = require(`./utils/build-plugin-node`)
const getObjectFromNode = require(`./utils/get-object-from-node`)
const { REQUIRES_KEYS } = require(`./utils/constants`)

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

const getSiteMetdataFromConfig = src => {
  const getSiteMetadata = new BabelPluginGetSiteMetadataFromConfig()

  babel.transform(src, {
    plugins: [getSiteMetadata.plugin],
    configFile: false,
  })

  return getSiteMetadata.state
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

    const siteMetadata = getSiteMetdataFromConfig(configSrc)

    if (!siteMetadata || !siteMetadata[id]) return null

    return {
      name: id,
      value: siteMetadata[id],
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
              const plugins = pluginNodes.value.elements
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
                    const plugin = null

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
                  const plugin = null

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

class BabelPluginGetSiteMetadataFromConfig {
  constructor() {
    this.state = {}

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

            const siteMetadata = right.properties.find(
              p => p.key.name === `siteMetadata`
            )

            if (!siteMetadata.value) return

            this.state = getObjectFromNode(siteMetadata.value)
          },
        },
      }
    })
  }
}

module.exports.addPluginToConfig = addPluginToConfig
module.exports.getSiteMetdataFromConfig = getSiteMetdataFromConfig
module.exports.removePluginFromConfig = removePluginFromConfig

module.exports.create = create
module.exports.update = create
module.exports.read = read
module.exports.destroy = destroy
module.exports.config = {}

module.exports.all = async ({ root }) => {
  const configSrc = await readConfigFile(root)
  const siteMetadata = getSiteMetdataFromConfig(configSrc)

  return Object.keys(siteMetadata).map(key => {
    return {
      name: key,
      value: JSON.stringify(siteMetadata[key]),
    }
  })
}

const schema = {
  value: Joi.string(),
  name: Joi.string(),
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
