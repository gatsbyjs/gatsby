const { isString } = require("lodash");

module.exports = pluginOptions => {
  const options = Object.assign(
    {
      extensions: [".mdx"],
      mdPlugins: [],
      hastPlugins: [],
      defaultLayouts: {}
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

  return options;
};
