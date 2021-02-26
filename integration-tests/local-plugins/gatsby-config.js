module.exports = {
  plugins: [
    {
      resolve: `local-plugin`,
      options: {
        required: true,
      },
    },
    {
      resolve: require.resolve(`./local-plugin-with-path`),
      options: {
        required: true,
      },
    },
  ],
}
