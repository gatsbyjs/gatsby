const pathPrefix = `/blog`

module.exports = {
  assetPrefix: `http://localhost:9001`,
  pathPrefix: `/blog`,
  siteMetadata: {
    siteUrl: `http://localhost:9000`,
    title: `Gatsby Default Starter`,
  },
  plugins: [
    {
      resolve: `gatsby-plugin-manifest`,
      options: {
        name: `gatsby-starter-default`,
        short_name: `starter`,
        start_url: `/`,
        background_color: `#663399`,
        theme_color: `#663399`,
        display: `minimal-ui`,
        icon: `src/images/gatsby-icon.png`, // This path is relative to the root of the site.
      },
    },
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        path: `${__dirname}/src/images/`,
      },
    },
    `gatsby-plugin-sitemap`,
    `gatsby-plugin-sharp`,
    `gatsby-transformer-sharp`,
    `gatsby-plugin-image`,
    {
      resolve: `gatsby-plugin-feed`,
      options: {
        query: `
          {
            site {
              siteMetadata {
                siteUrl
                site_url: siteUrl
              }
            }
          }
        `,
        feeds: [
          {
            query: `
              {
                pages: allSitePage {
                  nodes {
                    path
                  }
                }
              }
            `,
            serialize({ query: { site, pages } }) {
              return pages.nodes.map(node => {
                return {
                  description: `A sample page hello world suh dude`,
                  date: `10-08-1990`,
                  url: `${site.siteMetadata.siteUrl}${pathPrefix}${node.path}`,
                }
              })
            },
            title: `assetPrefix + pathPrefix RSS Feed`,
            output: `rss.xml`,
          },
        ],
      },
    },
  ],
}
