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

  // backwards compatibility for `defaultLayout`
  if (options.defaultLayout && !options.defaultLayouts.default) {
    options.defaultLayouts.default = options.defaultLayout;
  }

  return options;
};
