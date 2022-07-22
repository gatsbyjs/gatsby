module.exports = {
  siteMetadata: {
    title: `Gatsby MDX e2e`,
    siteUrl: `https://example.com`,
  },
  plugins: [
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        name: `pages`,
        path: `${__dirname}/src/pages/`,
      },
    },
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        name: `posts`,
        path: `${__dirname}/src/posts`,
      },
    },
    {
      resolve: `gatsby-plugin-page-creator`,
      options: {
        path: `${__dirname}/src/posts`,
      },
    },
    `gatsby-plugin-test-regression1`,
    `gatsby-plugin-sharp`,
    {
      resolve: `gatsby-plugin-mdx`,
      options: {
        extensions: [`.mdx`, `.md`],
        gatsbyRemarkPlugins: [`gatsby-remark-images`],
        mdxOptions: {
          remarkPlugins: [remarkRequireFilePathPlugin],
        },
      },
    },
    !process.env.CI && `gatsby-plugin-webpack-bundle-analyser-v2`,
    {
      resolve: `gatsby-plugin-feed`,
      options: {
        query: `
          query SiteData {
            site {
              siteMetadata {
                title
                description
                siteUrl
                site_url: siteUrl
              }
            }
          }
        `,
        feeds: [
          {
            serialize: ({ query: { site, allFile } }) => {
              return allFile.edges.map(edge => {
                return Object.assign({}, edge.node.childMdx.frontmatter, {
                  description: edge.node.childMdx.excerpt,
                  date: edge.node.childMdx.fields.date,
                  url:
                    site.siteMetadata.siteUrl + edge.node.childMdx.fields.slug,
                  guid:
                    site.siteMetadata.siteUrl + edge.node.childMdx.fields.slug,
                  custom_elements: [
                    { "content:encoded": edge.node.childMdx.fields.html },
                  ],
                })
              })
            },
            query: `
              query MdxFeeds {
                allFile(
                  filter: { sourceInstanceName: { eq: "posts" } }
                  sort: { fields: childMdx___fields___date }
                ) {
                  edges {
                    node {
                      childMdx {
                        excerpt
                        frontmatter {
                          title
                        }
                        fields {
                          slug
                          date
                          html
                        }
                      }
                    }
                  }
                }
              }
            `,
            output: "/rss.xml",
            title: "Your Site's RSS Feed",
          },
        ],
      },
    },
  ].filter(Boolean),
}

/**
 * This is a test to ensure that `gatsby-plugin-mdx` correctly pass the `file` argument to the underlying remark plugins.
 * See #26914 for more info.
 */
function remarkRequireFilePathPlugin() {
  return function transformer(_, file) {
    if (!file.dirname) {
      throw new Error("No directory name for this markdown file!")
    }
  }
}
