require("dotenv").config({
  path: `.env.${process.env.NODE_ENV}`,
})


module.exports = {
  siteMetadata: {
    siteTitle: `Gatsby Kontent Benchmark`,
  },
  plugins: [
    `gatsby-plugin-benchmark-reporting`,
    `gatsby-plugin-sharp`,
    `gatsby-transformer-sharp`,
    {
      resolve: '@kentico/gatsby-source-kontent',
      options: {
        projectId: process.env.KONTENT_PROJECT_ID, // Fill in your Project ID
        languageCodenames: process.env.KONTENT_LANGUAGE_CODENAMES && process.env.KONTENT_LANGUAGE_CODENAMES.split(',')
      },
    },
    `@rshackleton/gatsby-transformer-kontent-image`,
  ],
}
