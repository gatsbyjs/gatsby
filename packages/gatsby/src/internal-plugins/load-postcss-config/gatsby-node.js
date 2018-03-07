/* @flow */
const findPostcssPlugins = require(`postcss-load-plugins`)
const autoprefixer = require(`autoprefixer`)
const flexbugs = require(`postcss-flexbugs-fixes`)
const report = require(`gatsby-cli/lib/reporter`)

// { stage, rules, loaders, actions, store, getConfig }
exports.onCreateWebpackConfig = async ({ actions, store }) => {
  const program = store.getState().program
  const { directory, browserslist } = program

  const defaultPlugins = {
    plugins: [
      flexbugs,
      autoprefixer({ browsers: browserslist, flexbox: `no-2009` }),
    ],
  }

  let customPlugins
  try {
    customPlugins = await findPostcssPlugins({}, directory)
  } catch (error) {
    if (!error.message.startsWith(`No PostCSS Config found in`)) {
      report.panicOnBuid(`Error loading postCSS config`, error)
    }
  }

  const postcssPlugins = customPlugins || defaultPlugins

  // Now we have a set of postCSS plugins...
  // How do we apply them to the webpack config?
  // with setWebpackConfig?

  // actions.setWebpackConfig({})
}
