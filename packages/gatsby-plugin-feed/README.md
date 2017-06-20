# gatsby-plugin-feed

Create an RSS feed (or multiple feeds) for your Gatsby site.

## Install

```npm install --save gatsby-plugin-feed```

## How to Use

```javascript
// In your gatsby-config.js
siteMetadata {
  title: `GatsbyJS`,
  description: `A fantastic new static site generator.`,
  site_url: `https://www.gatsbyjs.org`
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
              site_url
            }
          }
        }
      `,
      feeds: [
        {
          query: `
            {
              allMarkdownRemark(
                limit: 1000,
                sort: { order: DESC, fields: [frontmatter___date] },
                frontmatter: { draft: { ne: true } }
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
          output: '/rss.xml'
        }
      ]
    }
  }
]
```
