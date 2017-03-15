module.exports = {
  siteMetadata: {
    title: `Gatsby`,
  },
  mapping: {
    "MarkdownRemark.frontmatter.author": `Author`,
  },
  plugins: [
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        name: `docs`,
        path: `${__dirname}/../docs/`,
      },
    },
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        name: `packages`,
        path: `${__dirname}/../packages/`,
      },
    },
    `gatsby-parser-remark`,
    `gatsby-parser-sharp`,
    `gatsby-parser-yaml`,
    {
      resolve: `gatsby-typegen-remark`,
      options: {
        plugins: [
          {
            resolve: `gatsby-typegen-remark-responsive-image`,
            options: {
              maxWidth: 690,
              backgroundColor: `#f7f0eb`,
            },
          },
          {
            resolve: `gatsby-typegen-remark-responsive-iframe`,
            options: {
              wrapperStyle: `margin-bottom: 1.05rem`,
            },
          },
          `gatsby-typegen-remark-prismjs`,
          `gatsby-typegen-remark-copy-linked-files`,
          `gatsby-typegen-remark-smartypants`,
          `gatsby-typegen-remark-autolink-headers`,
        ],
      },
    },
    `gatsby-typegen-filesystem`,
    `gatsby-typegen-sharp`,
    `gatsby-plugin-glamor`,
    `gatsby-plugin-sharp`,
    `gatsby-plugin-catch-links`,
    {
      resolve: `gatsby-plugin-manifest`,
      options: {
        name: "GatsbyJS",
        short_name: "GatsbyJS",
        start_url: "/",
        background_color: "#f7f0eb",
        theme_color: "#a2466c",
        display: "minimal-ui",
      },
    },
    `gatsby-plugin-offline`,
    {
      resolve: `gatsby-plugin-google-analytics`,
      options: {
        trackingId: `UA-93349937-1`,
      },
    },
  ],
};
