module.exports = {
  siteMetadata: {
    title: `Gatsby 9689ff demo`,
  },
  plugins: [
    {
      resolve: "gatsby-plugin-gatsby-cloud",
    },
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        path: `${__dirname}/content/posts`,
        name: `blog`,
      },
    },
    {
      resolve: `gatsby-transformer-remark`,
      options: {
        plugins: [],
      },
    },
  ],
}
