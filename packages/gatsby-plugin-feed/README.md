# gatsby-plugin-feed

Create an RSS feed (or multiple feeds) for your Gatsby site.

## Install

`npm install --save gatsby-plugin-feed`

## How to Use

```javascript
// In your gatsby-config.js
module.exports = {
  plugins: [
    {
      resolve: `gatsby-plugin-feed`,
      options: {
        query: `
          {
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
            serialize: ({ query: { site, allMarkdownRemark } }) => {
              return allMarkdownRemark.edges.map(edge => {
                return Object.assign({}, edge.node.frontmatter, {
                  description: edge.node.excerpt,
                  date: edge.node.frontmatter.date,
                  url: site.siteMetadata.siteUrl + edge.node.fields.slug,
                  guid: site.siteMetadata.siteUrl + edge.node.fields.slug,
                  custom_elements: [{ "content:encoded": edge.node.html }],
                })
              })
            },
            query: `
              {
                allMarkdownRemark(
                  sort: { order: DESC, fields: [frontmatter___date] },
                ) {
                  edges {
                    node {
                      excerpt
                      html
                      fields { slug }
                      frontmatter {
                        title
                        date
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
  ],
}
```

Each feed must include `output`, `query`, and `title`. Additionally, it is strongly recommended to pass a custom `serialize` function, otherwise an internal serialize function will be used which may not exactly match your particular use case.

All additional options are passed through to the [`rss`][rss] utillity. For more info on those additional options, [explore the `itemOptions` section of the `rss` package](https://www.npmjs.com/package/rss#itemoptions).

Check out an example of [how you could implement](https://www.gatsbyjs.org/docs/adding-an-rss-feed/) to your own site, with a custom `serialize` function, and additional functionality.

_NOTE: This plugin only generates the `xml` file(s) when run in `production` mode! To test your feed, run: `gatsby build && gatsby serve`._

[rss]: https://www.npmjs.com/package/rss
