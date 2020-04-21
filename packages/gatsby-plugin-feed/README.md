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
            // optional configuration to insert feed reference in pages:
            // if `string` is used, it will be used to create RegExp and then test if pathname of
            // current page satisfied this regular expression;
            // if not provided or `undefined`, all pages will have feed reference inserted
            match: "^/blog/",
            // optional configuration to specify external rss feed, such as feedburner
            link: "https://feeds.feedburner.com/gatsby/blog",
          },
        ],
      },
    },
  ],
}
```

Each feed must include `output`, `query`, and `title`. Additionally, it is strongly recommended to pass a custom `serialize` function, otherwise an internal serialize function will be used which may not exactly match your particular use case.

`match` is an optional configuration, indicating which pages will have feed reference included. The accepted types of `match` are `string` or `undefined`. By default, when `match` is not configured, all pages will have feed reference inserted. If `string` is provided, it will be used to build a RegExp and then to test whether `pathname` of current page satisfied this regular expression. Only pages that satisfied this rule will have feed reference included.
`link` is an optional configuration that will override the default generated rss link from `output`.

All additional options are passed through to the [`rss`][rss] utility. For more info on those additional options, [explore the `itemOptions` section of the `rss` package](https://www.npmjs.com/package/rss#itemoptions).

Check out an example of [how you could implement](https://www.gatsbyjs.org/docs/adding-an-rss-feed/) to your own site, with a custom `serialize` function, and additional functionality.

_NOTE: This plugin only generates the `xml` file(s) when run in `production` mode! To test your feed, run: `gatsby build && gatsby serve`._

[rss]: https://www.npmjs.com/package/rss
