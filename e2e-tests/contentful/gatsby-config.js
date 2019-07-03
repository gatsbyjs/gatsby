module.exports = {
  siteMetadata: {
    siteUrl: `http://localhost:9000`,
    title: `Gatsby Default Starter`,
  },
  plugins: [
    {
      resolve: `gatsby-source-contentful`,
      options: {
        spaceId: `mn2gkf1rxy7p`,
        accessToken: `bcf02405156afee6fcde0180ab132d725e43732ed4473e3fedc6cd758e6c8397`,
      },
    },
  ],
}
