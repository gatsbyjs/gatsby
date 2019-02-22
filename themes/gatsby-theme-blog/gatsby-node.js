const path = require(`path`)
const Debug = require(`debug`)

/**
 * When shipping NPM modules, they typically need to be either
 * pre-compiled or the user needs to add bundler config to process the
 * files. Gatsby lets us ship the bundler config *with* the theme, so
 * we never need a lib-side build step.  Since we dont pre-compile the
 * theme, this is how we let webpack know how to process files.
 */
exports.onCreateWebpackConfig = ({ stage, loaders, plugins, actions }) => {
  const debug = Debug(`gatsby-theme-blog:onCreateWebpackConfig`)
  debug(`ensuring Webpack will compile theme code`)
  actions.setWebpackConfig({
    module: {
      rules: [
        {
          test: /\.js$/,
          include: path.dirname(require.resolve(`gatsby-theme-blog`)),
          use: [loaders.js()],
        },
      ],
    },
  })
}
