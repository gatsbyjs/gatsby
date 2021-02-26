module.exports = {
  plugins: [
    {
      resolve: `local-plugin`,
      options: {
        required: true,
      },
    },
    {
      resolve: require.resolve(`./plugins/local-plugin`),
      options: {
        required: true,
      },
    },
  ],
}
