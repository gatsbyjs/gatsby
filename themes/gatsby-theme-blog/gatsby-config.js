module.exports = options => {
  const { mdx = true } = options

  return {
    plugins: [
      {
        resolve: `gatsby-theme-blog-core`,
        options: { mdx },
      },
      `gatsby-plugin-react-helmet`,
      `gatsby-plugin-twitter`,
      `gatsby-plugin-emotion`,
      `gatsby-plugin-theme-ui`,
    ],
  }
}
