module.exports = {
  plugins: [
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        name: `videos`,
        path: `${__dirname}/videos/`,
      },
    },
    `gatsby-transformer-video`,
  ],
}
