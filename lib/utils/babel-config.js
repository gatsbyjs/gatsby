import resolve from 'babel-core/lib/helpers/resolve'
import fs from 'fs'
import path from 'path'
import json5 from 'json5'
import startsWith from 'lodash/startsWith'
import invariant from 'invariant'

const DEFAULT_BABEL_CONFIG = {
  presets: ['react', 'es2015', 'stage-0'],
  plugins: ['add-module-exports', 'transform-object-assign'],
}

/**
 * Uses babel-core helpers to resolve the plugin given it's name. It
 * resolves plugins in the following order:
 *
 * 1. Adding babel-type prefix and checking user's local modules
 * 2. Adding babel-type prefix and checking gatsby's modules
 * 3. Checking users's modules without prefix
 * 4. Checking gatsby's modules without prefix
 *
 */
function resolvePlugin (pluginName, directory, type) {
  const gatsbyPath = path.resolve('..', '..')
  const plugin = resolve(`babel-${type}-${pluginName}`, directory) ||
    resolve(`babel-${type}-${pluginName}`, gatsbyPath) ||
    resolve(pluginName, directory) ||
    resolve(pluginName, gatsbyPath)

  const name = !startsWith(pluginName, 'babel') ? pluginName : `babel-${type}-${pluginName}`
  const pluginInvariantMessage = `
  You are trying to use a babel plugin which gatsby cannot find. You
  can install it using "npm install --save ${name}".

  You can use any of the gatsby provided plugins without installing them:
    - babel-plugin-add-module-exports
    - babel-preset-es2015
    - babel-preset-react
    - babel-preset-stage-0
  `

  invariant(plugin !== null, pluginInvariantMessage)
  return plugin
}

/**
 * Normalizes a babel config object to include only absolute paths.
 * This way babel-loader will correctly resolve babel plugins
 * regardless of where they are located.
 */
function normalizeConfig (config, directory) {
  const normalizedConfig = {
    presets: [],
    plugins: [],
  }

  const presets = config.presets || []
  presets.forEach(preset => {
    normalizedConfig.presets.push(resolvePlugin(preset, directory, 'preset'))
  })

  const plugins = config.plugins || []
  plugins.forEach(plugin => {
    normalizedConfig.plugins.push(resolvePlugin(plugin, directory, 'plugin'))
  })

  return normalizedConfig
}

/**
 * Locates a babelrc in the gatsby site root directory. Parses it using
 * json5 (what babel uses). It throws an error if the users's babelrc is
 * not parseable.
 */
function findBabelrc (directory) {
  try {
    const babelrc = fs.readFileSync(path.join(directory, '.babelrc'), 'utf-8')
    return json5.parse(babelrc)
  } catch (error) {
    if (error.code === 'ENOENT') {
      return null
    } else {
      throw error
    }
  }
}

/**
 * Reads the user's package.json and returns the babel section. It will
 * return undefined when the babel section does not exist.
 */
function findBabelPackage (directory) {
  try {
    const packageJson = require(path.join(directory, 'package.json'))
    return packageJson.babel
  } catch (error) {
    if (error.code === 'MODULE_NOT_FOUND') {
      return null
    } else {
      throw error
    }
  }
}

/**
 * Returns a normalized babel config to use with babel-loader. All of
 * the paths will be absolute so that babel behaves as expected.
 */
export default function babelConfig (program, stage) {
  const { directory } = program

  const babelrc = findBabelrc(directory) ||
    findBabelPackage(directory) ||
    DEFAULT_BABEL_CONFIG

  if (stage === 'develop') {
    babelrc.presets.unshift('react-hmre')
  }

  return normalizeConfig(babelrc, directory)
}
