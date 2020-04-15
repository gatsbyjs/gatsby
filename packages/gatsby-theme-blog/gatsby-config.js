module.exports = options => {
  return {
    plugins: [
      {
        resolve: `gatsby-theme-blog-core`,
        options,
      },
      `gatsby-plugin-react-helmet`,
      `gatsby-plugin-twitter`,
      `gatsby-plugin-emotion`,
      {
        resolve: require.resolve(`../gatsby-theme-ui-preset`),
      },
    ],
  }
}
