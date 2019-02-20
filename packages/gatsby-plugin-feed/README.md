# gatsby-plugin-feed

Create an RSS feed (or multiple feeds) for your Gatsby site.

## Install

`npm install --save gatsby-plugin-feed`

## How to Use

```javascript
// In your gatsby-config.js
siteMetadata: {
  title: `GatsbyJS`,
  description: `Blazing fast modern site generator for React`,
  siteUrl: `https://www.gatsbyjs.org`
},
plugins: [
  {
    resolve: `gatsby-plugin-feed`
  }
]
```

To complete the feed setup, you need to expose a GraphQL entry for our content called `fields.slug` by modifying `gatsby-node.js`. Start with the following code, noting the reference to `MarkdownRemark` content. For content sources other than Markdown, you will want to modify it:

```js:title=gatsby-node.js
const { createFilePath } = require(`gatsby-source-filesystem`)

exports.onCreateNode = ({ node, actions, getNode }) => {
  const { createNodeField } = actions
  // highlight-next-line
  if (node.internal.type === `MarkdownRemark`) {
    const value = createFilePath({ node, getNode })
    createNodeField({
      name: `slug`,
      node,
      value,
    })
  }
}
```

Above is the minimal configuration required to begin working. If you wish to
customize the query being executed to retrieve nodes, try this:

```javascript
// In your gatsby-config.js
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
                limit: 1000,
                sort: { order: DESC, fields: [frontmatter___date] },
                filter: {frontmatter: { draft: { ne: true } }}
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
          title: "Gatsby RSS Feed",
        },
      ],
    },
  },
]
```

To see what option keys are valid, see [the itemOptions section](https://www.npmjs.com/package/rss#itemoptions) of the RSS module.

NOTE: This plugin only generates the `/rss.xml` file when run in `production` mode! To test your feed, run: `gatsby build && gatsby serve`.
