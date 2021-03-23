module.exports = {
  plugins: [
    "structured-plugin-errors",
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
  ],
}
