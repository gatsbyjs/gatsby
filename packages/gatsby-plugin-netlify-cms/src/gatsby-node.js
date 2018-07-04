const HtmlWebpackPlugin = require(`html-webpack-plugin`)
const ExtractTextPlugin = require(`extract-text-webpack-plugin`)

const extractCmsCss = new ExtractTextPlugin(`cms.css`)

function plugins(stage) {
  const commonPlugins = [
    // Output /admin/index.html
    new HtmlWebpackPlugin({
      title: `Content Manager`,
      filename: `admin/index.html`,
      chunks: [`cms`],
    }),
  ]

  if (stage === `develop`) {
    return commonPlugins
  } else if (stage === `build-javascript`) {
    return [...commonPlugins, extractCmsCss]
  }

  return []
}

/**
 * Exclude Netlify CMS styles from Gatsby CSS bundle. This relies on Gatsby
 * using webpack-configurator for webpack config extension, and also on the
 * target loader key being named "css" in Gatsby's webpack config.
 */
function excludeFromLoader({ actions, rules, getConfig }) {
  const regex = /\/node_modules\/netlify-cms\//

  const cssRule = { ...rules.css(), exclude: regex }

  const prevConfig = getConfig()

  actions.replaceWebpackConfig({
    ...prevConfig,

    module: {
      ...prevConfig.module,

      rules: prevConfig.module.rules.map((rule) => {
        const isCssRule = rule.oneOf && (
          rule.oneOf.some(({ test }) => String(test) === String(cssRule.test))
        )

        if (isCssRule) {
          const newRule = {
            ...rule,

            oneOf: rule.oneOf.map((rule) => {
              const { exclude: prevExclude } = rule

              if (!prevExclude) {
                return {
                  ...rule,
                  exclude: regex,
                }
              } else if (Array.isArray(prevExclude)) {
                return {
                  ...rule,
                  exclude: [
                    ...prevExclude,
                    regex,
                  ],
                }
              }

              return {
                ...rule,
                exclude: [ prevExclude, regex ],
              }
            }),
          }

          return newRule
        }

        return rule
      }),
    },
  })
}

function module(args) {
  const { stage, getConfig, actions } = args

  if (stage === `build-css`) {
    excludeFromLoader(args)
  } else if (stage === `build-javascript`) {
    excludeFromLoader(args)

    // Exclusively extract Netlify CMS styles to /cms.css (filename configured
    // above with plugin instantiation).

    const prevConfig = getConfig()

    actions.replaceWebpackConfig({
      ...prevConfig,

      module: {
        ...prevConfig.module,

        rules: [
          ...prevConfig.module.rules,

          {
            test: /\.css$/,
            include: [/\/node_modules\/netlify-cms\//],
            loader: extractCmsCss.extract([`css`]),
          },
        ],
      },
    })
  }
}

exports.onCreateWebpackConfig = (args, { modulePath }) => {
  const { actions, stage, getConfig } = args

  if (stage === `develop` || stage === `build-javascript`) {
    const prevConfig = getConfig()

    actions.replaceWebpackConfig({
      ...prevConfig,

      entry: {
        ...prevConfig.entry,

        cms: [`${__dirname}/cms.js`, modulePath].filter(p => p),
      },
      plugins: [
        ...prevConfig.plugins,

        ...plugins(stage),
      ],
    })
  }

  module(args)
}
