const { isString, once } = require("lodash");
const debug = require("debug")("gatsby-mdx:utils/default-options");

const optDebug = once(options => {
  debug("options", options);
});

module.exports = pluginOptions => {
  const options = Object.assign(
    {
      defaultLayouts: {},
      extensions: [".mdx"],
      mediaTypes: ["text/markdown", "text/x-markdown"],
      hastPlugins: [],
      mdPlugins: [],
      root: process.cwd(),
      gatsbyRemarkPlugins: [],
      globalScope: `export default {}`
    },
    pluginOptions
  );

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
