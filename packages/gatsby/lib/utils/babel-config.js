/* @flow weak */
import resolve from "babel-core/lib/helpers/resolve"
import fs from "fs"
import path from "path"
import json5 from "json5"
import _ from "lodash"
import objectAssign from "object-assign"
import invariant from "invariant"
import apiRunnerNode from "./api-runner-node"

/**
 * Uses babel-core helpers to resolve the plugin given it's name. It
 * resolves plugins in the following order:
 *
 * 1. Adding babel-type prefix and checking user's local modules
 * 2. Adding babel-type prefix and checking Gatsby's modules
 * 3. Checking users's modules without prefix
 * 4. Checking Gatsby's modules without prefix
 *
 */
function resolvePlugin(pluginName, directory, type) {
  const gatsbyPath = path.resolve(__dirname, `..`, `..`)
  const plugin = resolve(`babel-${type}-${pluginName}`, directory) ||
    resolve(`babel-${type}-${pluginName}`, gatsbyPath) ||
    resolve(pluginName, directory) ||
    resolve(pluginName, gatsbyPath)

  const name = _.startsWith(pluginName, `babel`)
    ? pluginName
    : `babel-${type}-${pluginName}`
  const pluginInvariantMessage = `
  You are trying to use a Babel plugin which Gatsby cannot find. You
  can install it using "npm install --save ${name}".

  You can use any of the Gatsby provided plugins without installing them:
    - babel-plugin-add-module-exports
    - babel-plugin-transform-object-assign
    - babel-preset-es2015
    - babel-preset-react
    - babel-preset-stage-0
  `

  invariant(plugin !== null, pluginInvariantMessage)
  return plugin
}

/**
 * Normalizes a Babel config object to include only absolute paths.
 * This way babel-loader will correctly resolve Babel plugins
 * regardless of where they are located.
 */
function normalizeConfig(config, directory) {
  const normalizedConfig = {
    presets: [],
    plugins: [],
  }

  const presets = config.presets || []
  presets.forEach(preset => {
    normalizedConfig.presets.push(resolvePlugin(preset, directory, `preset`))
  })

  const plugins = config.plugins || []
  plugins.forEach(plugin => {
    let normalizedPlugin

    if (_.isArray(plugin)) {
      normalizedPlugin = [
        resolvePlugin(plugin[0], directory, `plugin`),
        plugin[1],
      ]
    } else {
      normalizedPlugin = resolvePlugin(plugin, directory, `plugin`)
    }

    normalizedConfig.plugins.push(normalizedPlugin)
  })

  return objectAssign({}, config, normalizedConfig)
}

/**
 * Locates a .babelrc in the Gatsby site root directory. Parses it using
 * json5 (what Babel uses). It throws an error if the users's .babelrc is
 * not parseable.
 */
function findBabelrc(directory) {
  try {
    const babelrc = fs.readFileSync(path.join(directory, `.babelrc`), `utf-8`)
    return json5.parse(babelrc)
  } catch (error) {
    if (error.code === `ENOENT`) {
      return null
    } else {
      throw error
    }
  }
}

/**
 * Reads the user's package.json and returns the "babel" section. It will
 * return undefined when the "babel" section does not exist.
 */
function findBabelPackage(directory) {
  try {
    // $FlowIssue - https://github.com/facebook/flow/issues/1975
    const packageJson = require(path.join(directory, `package.json`))
    return packageJson.babel
  } catch (error) {
    if (error.code === `MODULE_NOT_FOUND`) {
      return null
    } else {
      throw error
    }
  }
}

/**
 * Returns a normalized Babel config to use with babel-loader. All of
 * the paths will be absolute so that Babel behaves as expected.
 */
module.exports = async function babelConfig(program, stage) {
  const { directory } = program

  let babelrc = findBabelrc(directory) || findBabelPackage(directory)

  // If user doesn't have a custom babelrc, add defaults.
  if (!babelrc) {
    babelrc = {}
  }
  if (!babelrc.plugins) {
    babelrc.plugins = []
  }
  if (!babelrc.presets) {
    babelrc.presets = []
  }

  // Add default plugins and presets.
  [`es2015`, `stage-0`, `react`].forEach(preset => {
    babelrc.presets.push(preset)
  });
  [`add-module-exports`, `transform-object-assign`].forEach(plugin => {
    babelrc.plugins.push(plugin)
  })

  if (stage === `develop`) {
    babelrc.plugins.unshift(`transform-react-jsx-source`)
    babelrc.plugins.unshift(`react-hot-loader/babel`)
  }

  // Always add this plugin so our generated routes
  // will work regardless of how users export
  // their components. Yeah for multiple module standards!
  babelrc.plugins.unshift(`add-module-exports`)

  if (!babelrc.hasOwnProperty(`cacheDirectory`)) {
    babelrc.cacheDirectory = true
  }

  const normalizedConfig = normalizeConfig(babelrc, directory)
  let modifiedConfig = await apiRunnerNode(`modifyBabelrc`, { babelrc })
  if (modifiedConfig.length > 0) {
    modifiedConfig = _.merge({}, ...modifiedConfig)
    // Otherwise this means no plugin changed the babel config.
  } else {
    modifiedConfig = {}
  }

  // Merge all together.
  const merged = _.defaultsDeep(modifiedConfig, normalizedConfig)
  return merged
}
