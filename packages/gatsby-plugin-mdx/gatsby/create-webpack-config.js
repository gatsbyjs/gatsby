const path = require(`path`)
const escapeStringRegexp = require(`escape-string-regexp`)
const defaultOptions = require(`../utils/default-options`)

module.exports = (
  { stage, loaders, actions, plugins, cache, ...other },
  pluginOptions
) => {
  const options = defaultOptions(pluginOptions)
  const testPattern = new RegExp(
    options.extensions.map(ext => `${escapeStringRegexp(ext)}$`).join(`|`)
  )
  actions.setWebpackConfig({
    module: {
      rules: [
        {
          test: /\.js$/,
          include: cache.directory,
          use: [loaders.js()],
        },
        {
          test: /\.js$/,
          include: path.dirname(require.resolve(`gatsby-plugin-mdx`)),
          use: [loaders.js()],
        },

        {
          test: /mdx-components\.js$/,
          include: path.dirname(require.resolve(`gatsby-plugin-mdx`)),
          use: [
            loaders.js(),
            {
              loader: path.join(
                `gatsby-plugin-mdx`,
                `loaders`,
                `mdx-components`
              ),
              options: {
                plugins: options.mdxPlugins,
              },
            },
          ],
        },
        {
          test: /mdx-scopes\.js$/,
          include: path.dirname(require.resolve(`gatsby-plugin-mdx`)),
          use: [
            loaders.js(),
            {
              loader: path.join(`gatsby-plugin-mdx`, `loaders`, `mdx-scopes`),
              options: {
                cache: cache,
              },
            },
          ],
        },
        {
          test: /mdx-wrappers\.js$/,
          include: path.dirname(require.resolve(`gatsby-plugin-mdx`)),
          use: [
            loaders.js(),
            {
              loader: path.join(`gatsby-plugin-mdx`, `loaders`, `mdx-wrappers`),
              options: {
                store: other.store,
              },
            },
          ],
        },
        {
          test: testPattern,
          use: [
            loaders.js(),
            {
              loader: path.join(`gatsby-plugin-mdx`, `loaders`, `mdx-loader`),
              options: {
                cache: cache,
                actions: actions,
                ...other,
                pluginOptions: options,
              },
            },
          ],
        },
      ],
    },
    plugins: [
      plugins.define({
        __DEVELOPMENT__: stage === `develop` || stage === `develop-html`,
      }),
    ],
  })
}
