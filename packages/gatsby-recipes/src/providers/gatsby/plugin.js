import fs from "fs-extra"
import path from "path"
import { transform } from "@babel/core"
import * as t from "@babel/types"
import { declare } from "@babel/helper-plugin-utils"
import * as Joi from "@hapi/joi"
import glob from "glob"
import prettier from "prettier"
import { slash } from "gatsby-core-utils"
import fetch from "node-fetch"

import lock from "../lock"
import getDiff from "../utils/get-diff"
import resourceSchema from "../resource-schema"

import isDefaultExport from "./utils/is-default-export"
import buildPluginNode from "./utils/build-plugin-node"
import getObjectFromNode from "./utils/get-object-from-node"
import { getValueFromNode } from "./utils/get-object-from-node"
import { REQUIRES_KEYS } from "./utils/constants"

import { read as readPackageJSON } from "../npm/package"

const fileExists = filePath => fs.existsSync(filePath)

const listShadowableFilesForTheme = (directory, theme) => {
  const themePath = path.dirname(
    require.resolve(slash(path.join(theme, `package.json`)), {
      paths: [directory],
    })
  )
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
  if (!t.isObjectExpression(node) && !t.isLogicalExpression(node)) {
    return undefined
  }

  let options

  // When a plugin is added conditionally with && {}
  if (t.isLogicalExpression(node)) {
    options = node.right.properties.find(
      property => property.key.name === `options`
    )
  } else {
    options = node.properties.find(property => property.key.name === `options`)
  }

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

  // When a plugin is added conditionally with && {}
  if (t.isLogicalExpression(node)) {
    const key = node.right.properties.find(p => p.key.name === `__key`)

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

  // When a plugin is added conditionally with && {}
  if (t.isLogicalExpression(node)) {
    const resolve = node.right.properties.find(p => p.key.name === `resolve`)

    return resolve ? getValueFromNode(resolve.value) : null
  }

  return null
}

const getDescriptionForPlugin = async (root, name) => {
  const pkg = await readPackageJSON(root, name)

  return pkg?.description || ``
}

const readmeCache = new Map()

const getPath = (module, file, root) => {
  try {
    return require.resolve(`${module}/${file}`, { paths: [root] })
  } catch (e) {
    return undefined
  }
}

const getReadmeForPlugin = async (root, name) => {
  if (readmeCache.has(name)) {
    return readmeCache.get(name)
  }

  let readmePath

  const readmes = [`readme.txt`, `readme`, `readme.md`, `README`, `README.md`]
  while (!readmePath && readmes.length) {
    readmePath = getPath(name, readmes.pop(), root)
  }

  try {
    if (readmePath) {
      const readme = await fs.readFile(readmePath, `utf8`)
      if (readme) {
        readmeCache.set(name, readme)
      }
      return readme
    }

    const readme = await fetch(`https://unpkg.com/${name}/README.md`)
      .then(res => res.text())
      .catch(() => null)

    if (readme) {
      readmeCache.set(name, readme)
    }
    return readme || ``
  } catch (err) {
    return ``
  }
}

const addPluginToConfig = (src, { name, options, key }) => {
  const addPlugins = new BabelPluginAddPluginsToGatsbyConfig({
    pluginOrThemeName: name,
    options,
    shouldAdd: true,
    key,
  })

  const { code } = transform(src, {
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

  const { code } = transform(src, {
    plugins: [addPlugins.plugin],
    configFile: false,
  })

  return code
}

const getPluginsFromConfig = src => {
  const getPlugins = new BabelPluginGetPluginsFromGatsbyConfig()

  transform(src, {
    plugins: [getPlugins.plugin],
    configFile: false,
  })

  return getPlugins.state
}

const getConfigPath = root => path.join(root, `gatsby-config.js`)

const defaultConfig = `/**
 * Configure your Gatsby site with this file.
 *
 * See: https://www.gatsbyjs.com/docs/gatsby-config/
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
  const release = await lock(`gatsby-config.js`)
  // TODO generalize this — it's for the demo.
  if (options?.accessToken === `(Known after install)`) {
    throw new MissingInfoError({ name, options, key })
  }
  const configSrc = await readConfigFile(root)
  const prettierConfig = await prettier.resolveConfig(root)

  let code = addPluginToConfig(configSrc, { name, options, key })
  code = prettier.format(code, { ...prettierConfig, parser: `babel` })

  await fs.writeFile(getConfigPath(root), code)

  const config = await read({ root }, key || name)
  release()
  return config
}

const read = async ({ root }, id) => {
  try {
    const configSrc = await readConfigFile(root)

    const plugin = getPluginsFromConfig(configSrc).find(
      plugin => plugin.key === id || plugin.name === id
    )

    if (plugin?.name) {
      const [description, readme] = await Promise.all([
        getDescriptionForPlugin(root, id),
        getReadmeForPlugin(root, id),
      ])
      const { shadowedFiles, shadowableFiles } = listShadowableFilesForTheme(
        root,
        plugin.name
      )

      return {
        id,
        description,
        readme,
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
              if (t.isCallExpression(pluginNodes.value)) {
                const plugins = pluginNodes.value.callee.object.elements.map(
                  getPlugin
                )
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

                  pluginNodes.value.callee.object.elements.push(pluginNode)
                } else {
                  pluginNodes.value.callee.object.elements = pluginNodes.value.callee.object.elements.map(
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
              }
            } else {
              if (t.isCallExpression(pluginNodes.value)) {
                pluginNodes.value.callee.object.elements = pluginNodes.value.callee.object.elements.filter(
                  node => {
                    const plugin = getPlugin(node)

                    if (key) {
                      return plugin.key !== key
                    }

                    return plugin.name !== pluginOrThemeName
                  }
                )
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

            let pluginsList = []

            if (t.isCallExpression(plugins.value)) {
              pluginsList = plugins.value.callee.object?.elements
            } else {
              pluginsList = plugins.value.elements
            }

            if (!pluginsList) {
              throw new Error(
                `Your gatsby-config.js format is currently not supported by Gatsby Admin. Please share your gatsby-config.js file via the "Send feedback" button. Thanks!`
              )
            }

            pluginsList.map(node => {
              this.state.push(getPlugin(node))
            })
          },
        },
      }
    })
  }
}

export { addPluginToConfig, getPluginsFromConfig, removePluginFromConfig }
export { create, create as update, read, destroy }

export const config = {}

export const all = async ({ root }, processPlugins = true) => {
  const configSrc = await readConfigFile(root)
  const plugins = getPluginsFromConfig(configSrc)

  return Promise.all(
    plugins.map(({ name }) => (processPlugins ? read({ root }, name) : name))
  )
}

const schema = {
  name: Joi.string(),
  description: Joi.string().optional().allow(null).allow(``),
  options: Joi.object(),
  isLocal: Joi.boolean(),
  readme: Joi.string().optional().allow(null).allow(``),
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

export { schema, validate }

export const plan = async (
  { root },
  { id, key, name, options, isLocal = false }
) => {
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
    dependsOn: isLocal ? null : [{ resourceName: `NPMPackage`, name }],
  }
}
