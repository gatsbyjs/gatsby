/* @flow */

const fs = require(`fs`)
const path = require(`path`)
const json5 = require(`json5`)
const _ = require(`lodash`)
const report = require(`gatsby-cli/lib/reporter`)

const testRequireError = require(`../../utils/test-require-error`).default

/**
 * Locates a .babelrc in the Gatsby site root directory. Parses it using
 * json5 (what Babel uses). It throws an error if the users's .babelrc is
 * not parseable.
 */
function findBabelrc(directory) {
  const babelrcPath = path.join(directory, `.babelrc`)
  if (fs.existsSync(babelrcPath)) {
    try {
      const babelrc = fs.readFileSync(babelrcPath, `utf-8`)
      return json5.parse(babelrc)
    } catch (error) {
      throw error
    }
  }
  return null
}

/**
 * Locates a .babelrc.js in the Gatsby site root directory.
 * requires it and unwraps any esm default export
 */
const preferDefault = m => (m && m.default) || m
function findBabelrcJs(directory, stage) {
  let babelrc = null
  const babelrcPath = path.join(directory, `.babelrc.js`)
  try {
    babelrc = preferDefault(require(babelrcPath))
  } catch (error) {
    if (!testRequireError(babelrcPath, error)) {
      throw error
    }
  }

  // TODO support this
  if (typeof babelrc === `function`) {
    report.error(
      `.babelrc.js files that export a function are not supported in Gatsby`
    )
    return null
  }

  return babelrc
}

/**
 * Reads the user's package.json and returns the "babel" section. It will
 * return undefined when the "babel" section does not exist.
 */
function findBabelPackage(directory) {
  const packageJson = require(path.join(directory, `package.json`))
  try {
    // $FlowFixMe - https://github.com/facebook/flow/issues/1975
    return packageJson.babel
  } catch (error) {
    if (testRequireError(packageJson, error)) {
      return null
    } else {
      throw error
    }
  }
}

/**
 * Convert a babelrc from a .babelrc file or package.json
 * to actions to add it to the store.
 */
const actionifyBabelrc = (babelrc, actions) => {
  const { presets, plugins, ...options } = babelrc
  if (presets && _.isArray(presets)) {
    presets.forEach(p => {
      let name
      let options = {}
      if (_.isArray(p)) {
        name = p[0]
        options = p[1]
      } else {
        name = p
      }
      actions.setBabelPreset({
        name,
        options,
      })
    })
  }
  if (plugins && _.isArray(plugins)) {
    plugins.forEach(p => {
      let name
      let options = {}
      if (_.isArray(p)) {
        name = p[0]
        options = p[1]
      } else {
        name = p
      }
      actions.setBabelPlugin({
        name,
        options,
      })
    })
  }

  if (_.isObject(options) && !_.isEmpty(options)) {
    actions.setBabelOptions({ options })
  }
}

exports.actionifyBabelrc = actionifyBabelrc

/**
 * Creates a normalized Babel config to use with babel-loader. Loads a local
 * babelrc config if one exists or sets a backup default.
 */
exports.onCreateBabelConfig = ({ stage, store, actions }) => {
  const program = store.getState().program
  const { directory } = program

  let babelrc =
    findBabelrc(directory) ||
    findBabelrcJs(directory) ||
    findBabelPackage(directory)

  // If user doesn't have a custom babelrc, add defaults.
  if (babelrc) {
    actionifyBabelrc(babelrc, actions)
  } else {
    addDefaultPluginsPresets(actions, {
      stage,
      browserslist: program.browserslist,
    })
  }
}

const addDefaultPluginsPresets = (
  actions,
  { stage = ``, browserslist = {} }
) => {
  // Presets
  actions.setBabelPreset({
    name: `@babel/preset-env`,
    stage,
    options: {
      loose: true,
      modules: false,
      useBuiltIns: `usage`,
      sourceType: `unambiguous`,
      shippedProposals: true, // includes async/await and Object spread/rest
      targets: { browsers: browserslist },
    },
  })
  actions.setBabelPreset({
    name: `@babel/preset-react`,
    stage,
    options: {
      useBuiltIns: true,
      pragma: `React.createElement`,
      development: stage === `develop`,
    },
  })
  actions.setBabelPreset({ name: `@babel/preset-flow`, stage })

  // Plugins
  actions.setBabelPlugin({
    name: `@babel/plugin-proposal-class-properties`,
    stage,
    options: { loose: true },
  })
  actions.setBabelPlugin({
    name: `@babel/plugin-syntax-dynamic-import`,
    stage,
  })
  // Polyfills the runtime needed for async/await and generators
  actions.setBabelPlugin({
    name: `@babel/plugin-transform-runtime`,
    stage,
    options: {
      helpers: true,
      regenerator: true,
      polyfill: false,
    },
  })
}

exports.addDefaultPluginsPresets = addDefaultPluginsPresets
