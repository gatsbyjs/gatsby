module.exports = {
  siteMetadata: {
    title: `Gatsby`,
    siteUrl: `https://www.gatsbyjs.org`,
    description: `Blazing-fast static site generator for React`,
  },
  mapping: {
    "MarkdownRemark.frontmatter.author": `AuthorYaml`,
  },
  plugins: [
    {
      resolve: `gatsby-source-npm-package-search`,
      options: {
        keywords: [`gatsby-plugin`, `gatsby-component`],
      },
    },
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
    {
      resolve: `gatsby-plugin-typography`,
      options: {
        pathToConfigModule: `src/utils/typography`,
      },
    },
    `gatsby-transformer-sharp`,
    `gatsby-transformer-documentationjs`,
    `gatsby-transformer-yaml`,
    {
      resolve: `gatsby-transformer-remark`,
      options: {
        plugins: [
          {
            resolve: `gatsby-remark-images`,
            options: {
              maxWidth: 786,
              backgroundColor: `#ffffff`,
            },
          },
          {
            resolve: `gatsby-remark-responsive-iframe`,
            options: {
              wrapperStyle: `margin-bottom: 1.05rem`,
            },
          },
          `gatsby-remark-prismjs`,
          `gatsby-remark-copy-linked-files`,
          `gatsby-remark-autolink-headers`,
          `gatsby-remark-smartypants`,
        ],
      },
    },
    {
      resolve: `gatsby-plugin-nprogress`,
      options: {
        color: `#9D7CBF`,
        showSpinner: false,
      },
    },
    `gatsby-plugin-glamor`,
    `gatsby-plugin-sharp`,
    `gatsby-plugin-catch-links`,
    `gatsby-plugin-react-next`,
    `gatsby-plugin-lodash`,
    {
      resolve: `gatsby-plugin-manifest`,
      options: {
        name: `GatsbyJS`,
        short_name: `GatsbyJS`,
        start_url: `/`,
        background_color: `#ffffff`,
        theme_color: `#663399`,
        display: `minimal-ui`,
        icon: `src/assets/gatsby-icon.png`,
      },
    },
    {
      resolve: `gatsby-plugin-offline`,
      options: {
        navigateFallback: null,
        navigateFallbackWhitelist: [],
      },
    },
    `gatsby-transformer-csv`,
    `gatsby-plugin-twitter`,
    `gatsby-plugin-react-helmet`,
    {
      resolve: `gatsby-plugin-google-analytics`,
      options: {
        trackingId: `UA-93349937-1`,
      },
    },
    {
      resolve: `gatsby-plugin-fullstory`,
      options: {
        fs_org: `B2TRP`,
      },
    },
    `gatsby-plugin-sitemap`,
    {
      resolve: `gatsby-plugin-feed`,
      options: {
        feeds: [
          {
            query: `
              {
                allMarkdownRemark(
                  sort: { order: DESC, fields: [frontmatter___date] }
                  filter: {
                    frontmatter: { draft: { ne: true } }
                    fileAbsolutePath: { regex: "/docs.blog/" }
                  }
                ) {
                  edges {
                    node {
                      excerpt
                      html
                      frontmatter {
                        title
                        date
                        excerpt
                        author {
                          id
                        }
                      }
                      fields {
                        slug
                      }
                    }
                  }
                }
              }
            `,
            output: `/blog/rss.xml`,
            setup: ({
              query: {
                site: { siteMetadata },
              },
            }) => {
              return {
                title: siteMetadata.title,
                description: siteMetadata.description,
                feed_url: siteMetadata.siteUrl + `/blog/rss.xml`,
                site_url: siteMetadata.siteUrl,
                generator: `GatsbyJS`,
              }
            },
            serialize: ({ query: { site, allMarkdownRemark } }) =>
              allMarkdownRemark.edges.map(({ node }) => {
                return {
                  title: node.frontmatter.title,
                  description: node.frontmatter.excerpt || node.excerpt,
                  url: site.siteMetadata.siteUrl + node.fields.slug,
                  guid: site.siteMetadata.siteUrl + node.fields.slug,
                  custom_elements: [{ "content:encoded": node.html }],
                  author: node.frontmatter.author.id,
                }
              }),
          },
        ],
      },
    },
    `gatsby-plugin-netlify`,
    {
      resolve: `gatsby-plugin-mailchimp`,
      options: {
          endpoint: `https://gatsbyjs.us17.list-manage.com/subscribe/post?u=1dc33f19eb115f7ebe4afe5ee&amp;id=f366064ba7`,
      },
    },
  ],
}
