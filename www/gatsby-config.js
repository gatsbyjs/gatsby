const path = require(`path`)
const git = require(`git-rev-sync`)
require(`dotenv`).config({
  path: `.env.${process.env.NODE_ENV}`,
})

const GA = {
  identifier: `UA-93349937-5`,
  viewId: `176383508`,
}

const dynamicPlugins = []
// if (process.env.ANALYTICS_SERVICE_ACCOUNT) {
// // pick data from 3 months ago
// const startDate = new Date()
// startDate.setMonth(startDate.getMonth() - 3)
// dynamicPlugins.push({
// resolve: `gatsby-plugin-guess-js`,
// options: {
// GAViewID: GA.viewId,
// jwt: {
// client_email: process.env.ANALYTICS_SERVICE_ACCOUNT,
// private_key: process.env.ANALYTICS_SERVICE_ACCOUNT_KEY,
// },
// period: {
// startDate,
// endDate: new Date(),
// },
// },
// })
// }

if (process.env.AIRTABLE_API_KEY) {
  dynamicPlugins.push({
    resolve: `gatsby-source-airtable`,
    options: {
      apiKey: process.env.AIRTABLE_API_KEY,
      tables: [
        {
          baseId: `app0q5U0xkEwZaT9c`,
          tableName: `Community Events Submitted`,
          queryName: `CommunityEvents`,
        },
      ],
    },
  })
}

module.exports = {
  siteMetadata: {
    title: `GatsbyJS`,
    siteUrl: `https://www.gatsbyjs.org`,
    description: `Blazing fast modern site generator for React`,
    twitter: `@gatsbyjs`,
  },
  mapping: {
    "MarkdownRemark.frontmatter.author": `AuthorYaml`,
    "Mdx.frontmatter.author": `AuthorYaml`,
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
        ignore: [`**/dist/**`],
      },
    },
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        name: `ecosystem`,
        path: `${__dirname}/src/data/ecosystem/`,
      },
    },
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        name: `guidelines`,
        path: `${__dirname}/src/data/guidelines/`,
      },
    },
    `gatsby-transformer-gatsby-api-calls`,
    {
      resolve: `gatsby-plugin-typography`,
      options: {
        pathToConfigModule: `src/utils/typography`,
      },
    },
    `gatsby-transformer-documentationjs`,
    `gatsby-transformer-yaml`,
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        path: `${__dirname}/src/data/diagram`,
      },
    },
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        path: `${__dirname}/src/assets`,
      },
    },
    {
      resolve: `gatsby-plugin-mdx`,
      options: {
        extensions: [`.md`, `.mdx`],
        shouldBlockNodeFromTransformation(node) {
          return (
            [`NPMPackage`, `NPMPackageReadme`].includes(node.internal.type) ||
            (node.internal.type === `File` &&
              path.parse(node.dir).dir.endsWith(`packages`))
          )
        },
        gatsbyRemarkPlugins: [
          `gatsby-remark-graphviz`,
          `gatsby-remark-embed-video`,
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
              wrapperStyle: `margin-bottom: 1.5rem`,
            },
          },
          `gatsby-remark-autolink-headers`,
          `gatsby-remark-copy-linked-files`,
          `gatsby-remark-smartypants`,
        ],
      },
    },
    {
      resolve: `gatsby-transformer-remark`,
      options: {
        plugins: [
          `gatsby-remark-graphviz`,
          `gatsby-remark-embed-video`,
          `gatsby-remark-code-titles`,
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
              wrapperStyle: `margin-bottom: 1.5rem`,
            },
          },
          `gatsby-remark-autolink-headers`,
          `gatsby-remark-prismjs`,
          `gatsby-remark-copy-linked-files`,
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
    `gatsby-plugin-emotion`,
    `gatsby-transformer-sharp`,
    `gatsby-plugin-sharp`,
    `gatsby-plugin-catch-links`,
    `gatsby-plugin-layout`,
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
    `gatsby-plugin-offline`,
    {
      resolve: `gatsby-plugin-perf-metrics`,
      options: {
        appId: `1:216044356421:web:92185d5e24b3a2a1`,
      },
    },
    `gatsby-transformer-csv`,
    `gatsby-plugin-twitter`,
    `gatsby-plugin-react-helmet`,
    `gatsby-plugin-sitemap`,
    {
      resolve: `gatsby-plugin-google-analytics`,
      options: {
        trackingId: GA.identifier,
        anonymize: true,
        allowLinker: true,
      },
    },
    {
      resolve: `gatsby-plugin-feed`,
      options: {
        feeds: [
          {
            query: `
              {
                allMdx(
                  sort: { order: DESC, fields: [frontmatter___date] }
                  limit: 10,
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
            serialize: ({ query: { site, allMdx } }) =>
              allMdx.edges.map(({ node }) => {
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
    `gatsby-plugin-netlify-cache`,
    {
      resolve: `gatsby-plugin-mailchimp`,
      options: {
        endpoint: `https://gatsbyjs.us17.list-manage.com/subscribe/post?u=1dc33f19eb115f7ebe4afe5ee&amp;id=f366064ba7`,
      },
    },
    {
      resolve: `gatsby-transformer-screenshot`,
      options: {
        nodeTypes: [`StartersYaml`],
      },
    },
    {
      resolve: `gatsby-plugin-sentry`,
      options: {
        dsn: `https://2904ad31b1744c688ae19b627f51a5de@sentry.io/1471074`,
        release: git.long(),
        environment: process.env.NODE_ENV,
        enabled: (() =>
          [`production`, `stage`].indexOf(process.env.NODE_ENV) !== -1)(),
      },
    },
    // `gatsby-plugin-subfont`,
  ].concat(dynamicPlugins),
}
