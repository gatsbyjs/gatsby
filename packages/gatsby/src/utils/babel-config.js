/* @flow */

import fs from "fs"
import path from "path"
import json5 from "json5"
import _ from "lodash"
const report = require(`gatsby-cli/lib/reporter`)
import apiRunnerNode from "./api-runner-node"

// TODO update this to store Babelrc config in Redux store.

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
    if (error.code !== `ENOENT`) throw error
  }
  return null
}

/**
 * Locates a .babelrc.js in the Gatsby site root directory.
 * requires it and unwraps any esm default export
 */
function findBabelrcJs(directory, stage) {
  try {
    // $FlowFixMe
    let babelrc = require(path.join(directory, `.babelrc.js`))
    babelrc =
      babelrc && babelrc.__esModule ? babelrc.default || undefined : babelrc

    // TODO support this
    if (typeof babelrc === `function`) {
      report.error(
        `.babelrc.js files that export a function are not supported in Gatsby`
      )
      return null
    }

    return babelrc
  } catch (error) {
    if (error.code !== `ENOENT`) throw error
  }
  return null
}

/**
 * Reads the user's package.json and returns the "babel" section. It will
 * return undefined when the "babel" section does not exist.
 */
function findBabelPackage(directory) {
  try {
    // $FlowFixMe - https://github.com/facebook/flow/issues/1975
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

  let babelrc =
    findBabelrc(directory) ||
    findBabelrcJs(directory) ||
    findBabelPackage(directory)

  // If user doesn't have a custom babelrc, add defaults.
  if (!babelrc) {
    babelrc = {
      cacheDirectory: true,
      babelrc: false,
      presets: [
        [
          require.resolve(`@babel/preset-env`),
          {
            loose: true,
            modules: false,
            useBuiltIns: `usage`,
            sourceType: `unambiguous`,
            shippedProposals: true, // includes async/await and Object spread/rest
            targets: { browsers: program.browserslist },
          },
        ],
        [
          require.resolve(`@babel/preset-react`),
          {
            useBuiltIns: true,
            pragma: `React.createElement`,
            development: stage === `develop`,
          },
        ],
        require.resolve(`@babel/preset-flow`),
      ],
      plugins: [
        [
          require.resolve(`@babel/plugin-proposal-class-properties`),
          { loose: true },
        ],
        require.resolve(`@babel/plugin-syntax-dynamic-import`),
        // Polyfills the runtime needed for async/await and generators
        [
          require.resolve(`@babel/plugin-transform-runtime`),
          {
            helpers: true,
            regenerator: true,
            polyfill: false,
          },
        ],
      ],
    }
  }

  if (!babelrc.plugins) babelrc.plugins = []
  if (!babelrc.presets) babelrc.presets = []
  if (!babelrc.hasOwnProperty(`cacheDirectory`)) {
    babelrc.cacheDirectory = true
  }

  if (stage === `develop`) {
    // TODO: maybe this should be left to the user?
    babelrc.plugins.unshift(require.resolve(`react-hot-loader/babel`))
  }

  babelrc.plugins.unshift(
    require.resolve(`babel-plugin-remove-graphql-queries`)
  )

  let modifiedConfig = await apiRunnerNode(`modifyBabelrc`, { babelrc })

  if (modifiedConfig.length > 0) {
    modifiedConfig = _.merge({}, ...modifiedConfig)
    // Otherwise this means no plugin changed the babel config.
  } else {
    modifiedConfig = {}
  }

  // Merge all together.
  const merged = _.defaultsDeep(modifiedConfig, babelrc)
  return merged
}
