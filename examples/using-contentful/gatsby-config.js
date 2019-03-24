module.exports = {
  siteMetadata: {
    title: `Gatsby with Contentful`,
  },
  plugins: [
    // {
    //   resolve: `gatsby-source-contentful`,
    //   options: {
    //     spaceId: `rocybtov1ozk`,
    //     accessToken: `6f35edf0db39085e9b9c19bd92943e4519c77e72c852d961968665f1324bfc94`,
    //   },
    // },
    // below is configuration for copy of space that doesn't contain any content
    // but uses same content model. It actually works (as in without any content.
    // Note: It's space created on my personal account that probably will be removed later,
    // but you are free to test it out.
    {
      resolve: `gatsby-source-contentful`,
      options: {
        spaceId: `r8mgh95s9k6o`,
        accessToken: `4587874e01060502262c3e85c4de8f6a4007d6a0eb34eda1d63626bef79aa7f1`,
      },
    },
    `gatsby-transformer-remark`,
    {
      resolve: `gatsby-plugin-typography`,
      options: {
        pathToConfigModule: `src/utils/typography`,
      },
    },
  ],
}
