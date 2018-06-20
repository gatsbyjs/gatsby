const HtmlWebpackPlugin = require(`html-webpack-plugin`)
const ExtractTextPlugin = require(`mini-css-extract-plugin`)
const path = require(`path`)

const extractCmsCss = new ExtractTextPlugin({
  filename: `cms.css`,
})

function plugins(stage, rules) {
  const commonPlugins = [
    // Output /admin/index.html
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, `./template.html`),
      title: `Content Manager`,
      filename: `admin/index.html`,
      entryPoint: `cms`,
    }),
  ]

  switch (stage) {
    case `develop`:
      return {
        plugins: commonPlugins,
        rules: [],
      }
    case `build-javascript`:
      return {
        plugins: [...commonPlugins, extractCmsCss],
        rules: [
          {
            test: /\.css$/,
            include: [/\/node_modules\/netlify-cms\//],
            loader: extractCmsCss.loader,
          },
        ],
      }

    default:
      return []
  }
}

exports.onCreateWebpackConfig = ({ actions, stage, rules, getConfig }, { modulePath }) => {
  const info = plugins(stage, rules)
  const config = getConfig()
  let update = false
  config.module.rules.forEach((rule) => {
    if (rule.test && (rule.test.toString() === `.css$`)) {
      rule.exclude = rule.exclude || []
      rule.exclude.push(/\/node_modules\/netlify-cms\//)
      update = true
    }
  })
  if (info.rules && info.rules.length) {
    info.rules.forEach((rule) => {
      config.module.rules.push(rule)
      update = true
    })
  }
  if (info.plugins && info.plugins.length) {
    info.plugins.forEach((plugin) => {
      config.plugins.push(plugin)
      update = true
    })
  }
  if (update) {
    config.entry.cms = [`${__dirname}/cms.js`, modulePath].filter((d) => d)
    actions.replaceWebpackConfig(config)
  }
}
