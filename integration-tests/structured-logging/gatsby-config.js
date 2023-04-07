const dynamicPlugins = []

if (process.env.VALIDATE_PLUGIN_OPTIONS) {
  dynamicPlugins.push(
    {
      resolve: "local-plugin",
      options: {
        optionalString: 1234,
      },
    },
    {
      resolve: require.resolve("./local-plugin-with-path"),
      options: {
        optionalString: 1234,
      },
    },
  )
}

module.exports = {
  plugins: [
    "structured-plugin-errors",
    ...dynamicPlugins
  ],
}
