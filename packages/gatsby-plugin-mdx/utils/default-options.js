module.exports = pluginOptions =>
  Object.assign(
    {
      extensions: [".mdx"],
      mdPlugins: [],
      hastPlugins: []
    },
    pluginOptions
  );
