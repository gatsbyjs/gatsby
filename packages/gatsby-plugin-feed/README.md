# gatsby-plugin-feed

Create an RSS feed (or multiple feeds) for your Gatsby site.

## Install

`npm install --save gatsby-plugin-feed`

## How to Use

```javascript
// In your gatsby-config.js
siteMetadata: {
  title: `GatsbyJS`,
  description: `A fantastic new static site generator.`,
  siteUrl: `https://www.gatsbyjs.org`
},
plugins: [
  {
    resolve: `gatsby-plugin-feed`
  }
]
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
                url: site.siteMetadata.siteUrl + edge.node.fields.slug,
                guid: site.siteMetadata.siteUrl + edge.node.fields.slug,
                custom_elements: [{ "content:encoded": edge.node.html }],
              });
            });
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
        },
      ],
    },
  },
];
```

NOTE: This plugin only generates the `/rss.xml` file when run in `production` mode! To test your feed, run: `gatsby build && gatsby serve`.
