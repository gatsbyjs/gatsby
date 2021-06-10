module.exports = {
  plugins: [
    {
      resolve: `gatsby-plugin-test`,
      options: {
        fn: () => `foo`
      }
    }
  ],
}