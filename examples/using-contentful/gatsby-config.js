module.exports = {
  siteMetadata: {
    title: `Gatsby with Contentful`,
  },
  plugins: [
    {
      resolve: `gatsby-source-contentful`,
      options: {
        spaceId: `ubriaw6jfhm1`,
        accessToken: `e481b0f7c5572374474b29f81a91e8ac487bb27d70a6f14dd12142837d8e980a`,
      },
    },
    `gatsby-transformer-remark`,
  ],
}
