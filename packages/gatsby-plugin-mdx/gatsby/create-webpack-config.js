const path = require("path");
const escapeStringRegexp = require("escape-string-regexp");
const defaultOptions = require("../utils/default-options");

module.exports = (
  { stage, loaders, plugins, actions, getNodes },
  pluginOptions
) => {
  const options = defaultOptions(pluginOptions);
  const testPattern = new RegExp(
    options.extensions.map(ext => `${escapeStringRegexp(ext)}$`).join("|")
  );
  const mdxTestPattern = new RegExp(
    options.extensions
      .concat(".deck-mdx")
      .map(ext => `${escapeStringRegexp(ext)}$`)
      .join("|")
  );

  const decks = options.decks.map(ext => `${escapeStringRegexp(ext)}`);

  actions.setWebpackConfig({
    module: {
      rules: [
        {
          test: /\.js$/,
          include: path.resolve(__dirname, ".cache/gatsby-mdx"),
          use: [loaders.js()]
        },
        {
          test: testPattern,
          exclude: decks,
          use: [
            loaders.js(),
            {
              loader: "gatsby-mdx/loaders/mdx-loader",
              options: {
                getNodes,
                pluginOptions: options
              }
            }
          ]
        },
        {
          test: mdxTestPattern,
          include: decks,
          use: [
            loaders.js(),
            { loader: "gatsby-mdx/loaders/mdx-deck-post-loader" },
            { loader: "mdx-deck/loader" }
          ]
        },
        {
          test: /.deck-mdx$/,
          use: [
            loaders.js(),
            { loader: "gatsby-mdx/loaders/mdx-deck-post-loader" },
            { loader: "mdx-deck/loader" }
          ]
        }
      ]
    },
    plugins: [
      plugins.define({
        __DEVELOPMENT__: stage === `develop` || stage === `develop-html`
      })
    ]
  });
};
