/* @flow */
const findPostcssPlugins = require(`postcss-load-plugins`)
const autoprefixer = require(`autoprefixer`)
const flexbugs = require(`postcss-flexbugs-fixes`)
const report = require(`gatsby-cli/lib/reporter`)

exports.onCreateWebpackConfig = async ({
  actions,
  getConfig,
  loaders,
  rules,
  stage,
  store,
}) => {
  const program = store.getState().program
  const { directory, browserslist } = program

  // console.log(`initial config for stage: `, stage)
  // console.dir(getConfig(), { depth: null })

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
  const postcssRule = rules.postcss({ plugins: postcssPlugins })

  actions.setWebpackConfig({
    module: {
      rules: [postcssRule],
    },
  })

  // console.log(`UPDATED config for stage: `, stage)
  // console.dir(getConfig(), { depth: null })
}
