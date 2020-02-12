const path = require(`path`)
const langs = require(`./i18n.json`)
require(`dotenv`).config({
  path: `.env.${process.env.NODE_ENV}`,
})

const GA = {
  identifier: `UA-93349937-5`,
  viewId: `176383508`,
}

const dynamicPlugins = []
if (process.env.ANALYTICS_SERVICE_ACCOUNT) {
  // pick data from 3 months ago
  const startDate = new Date()
  // temporary lower guess to use 2 days of data to lower guess data
  // real fix is to move gatsby-plugin-guess to aot mode
  // startDate.setMonth(startDate.getMonth() - 3)
  startDate.setDate(startDate.getDate() - 2)
  dynamicPlugins.push({
    resolve: `gatsby-plugin-guess-js`,
    options: {
      GAViewID: GA.viewId,
      jwt: {
        client_email: process.env.ANALYTICS_SERVICE_ACCOUNT,
        // replace \n characters in real new lines for circleci deploys
        private_key: process.env.ANALYTICS_SERVICE_ACCOUNT_KEY.replace(
          /\\n/g,
          `\n`
        ),
      },
      period: {
        startDate,
        endDate: new Date(),
      },
    },
  })
}

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

if (process.env.ENABLE_LOCALIZATIONS) {
  dynamicPlugins.push(
    ...langs.map(({ code }) => ({
      resolve: `gatsby-source-git`,
      options: {
        name: `docs-${code}`,
        remote: `https://github.com/gatsbyjs/gatsby-${code}.git`,
        branch: `master`,
        patterns: `docs/tutorial/**`,
      },
    }))
  )
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
    `gatsby-plugin-theme-ui`,
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
          `gatsby-remark-embedder`,
          `gatsby-remark-graphviz`,
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
          {
            resolve: `gatsby-remark-autolink-headers`,
            options: {
              offsetY: 104,
            },
          },
          `gatsby-remark-copy-linked-files`,
          `gatsby-remark-smartypants`,
        ],
      },
    },
    {
      resolve: `gatsby-transformer-remark`,
      options: {
        plugins: [
          `gatsby-remark-embedder`,
          `gatsby-remark-graphviz`,
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
          {
            resolve: `gatsby-remark-autolink-headers`,
            options: {
              offsetY: 104,
            },
          },
          {
            resolve: `gatsby-remark-prismjs`,
            options: {
              aliases: {
                dosini: `ini`,
                env: `bash`,
                es6: `js`,
                flowchart: `none`,
                gitignore: `none`,
                gql: `graphql`,
                htaccess: `apacheconf`,
                mdx: `markdown`,
                ml: `fsharp`,
                styl: `stylus`,
              },
            },
          },
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
            title: `GatsbyJS`,
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
    {
      resolve: `gatsby-plugin-netlify`,
      options: {
        headers: {
          "/*": [`Referrer-Policy: strict-origin-when-cross-origin`],
        },
      },
    },
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
    // `gatsby-plugin-subfont`,
  ].concat(dynamicPlugins),
}
