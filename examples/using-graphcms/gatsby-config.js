module.exports = {
  siteMetadata: {
    title: `Gatsby with GraphCMS`,
  },
  plugins: [
    `gatsby-plugin-react-helmet`,
    {
      resolve: `gatsby-source-graphcms`,
      options: {
        endpoint: `https://api.graphcms.com/simple/v1/vinylbase`,
        query: `{
            allArtists {
              id
              name
            }
        }`,
      },
    },
  ],
}
