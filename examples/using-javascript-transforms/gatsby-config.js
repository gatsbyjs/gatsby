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
    `gatsby-transformer-javascript-frontmatter`,
    {
      resolve: `gatsby-transformer-remark`,
      options: {
        plugins: [`gatsby-remark-prismjs`],
      },
    },
    `gatsby-plugin-sass`,
  ],
}
