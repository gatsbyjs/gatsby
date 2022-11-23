module.exports = {
  siteMetadata: {
    title: `Gatsby Plugin Image`,
  },
  plugins: [
    `gatsby-plugin-sharp`,
    `gatsby-transformer-sharp`,
    { resolve: `gatsby-source-filesystem`, options: { path: "./src/images/" } },
    `gatsby-plugin-image`,
  ],
}
