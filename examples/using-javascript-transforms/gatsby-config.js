module.exports = {
  siteMetadata: {
    title: `Using Javascript Example`,
    siteDescr: `Some best practices for using JavaScript in Gatsby.`,
    siteAuthor: `The Gatsby`,

    siteEmailUrl: `me@x.com`,
    siteEmailPretty: `me@x.com`,
    siteTwitterUrl: `https://twitter.com/gatsbyjs`,
    siteTwitterPretty: `@gatsbyjs`,
  },
  plugins: [
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        name: `pages`,
        path: `${__dirname}/src/mainPages/`,
      },
    },
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        name: `articles`,
        path: `${__dirname}/src/articles/`,
      },
    },
    `gatsby-transformer-javascript-static-exports`,
    `gatsby-transformer-yaml`,
    {
      resolve: `gatsby-transformer-remark`,
      options: {
        plugins: [
          {
            resolve: `gatsby-remark-images`,
            options: {
              maxWidth: 690,
            },
          },
          {
            resolve: `gatsby-remark-responsive-iframe`,
            options: {},
          },
          `gatsby-remark-prismjs`,
          `gatsby-remark-copy-linked-files`,
          `gatsby-remark-smartypants`,
        ],
      },
    },
    `gatsby-plugin-sharp`,
    `gatsby-plugin-postcss-sass`,
    `gatsby-plugin-offline`,
  ],
}
