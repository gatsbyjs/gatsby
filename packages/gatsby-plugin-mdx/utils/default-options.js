const { isString, once } = require("lodash");
const debug = require("debug")("gatsby-mdx:utils/default-options");

const optDebug = once(options => {
  debug("options", options);
});

module.exports = pluginOptions => {
  const options = Object.assign(
    {
      decks: [],
      defaultLayouts: {},
      extensions: [".mdx"],
      hastPlugins: [],
      mdPlugins: [],
      transformers: {},
      root: process.cwd(),
      gatsbyRemarkPlugins: []
    },
    pluginOptions
  );

  // ensure File transformer is always ours
  options.transformers.File = {
    transformer: async ({ loadNodeContent, node }) => {
      const mdxContent = await loadNodeContent(node);
      return { meta: undefined, content: mdxContent };
    },
    // We only care about markdown content.
    // replace with mediaType when mime-db is merged
    //    node.internal.mediaType !== `text/mdx`
    filter: ({ node }) => options.extensions.includes(node.ext)
  };

  // support single layout set in the `defaultLayouts` option
  if (options.defaultLayouts && isString(options.defaultLayouts)) {
    options.defaultLayouts = {
      default: options.defaultLayouts
    };
  }

  // backwards compatibility for `defaultLayout`
  if (options.defaultLayout && !options.defaultLayouts.default) {
    options.defaultLayouts.default = options.defaultLayout;
  }

  optDebug(options);
  return options;
};
