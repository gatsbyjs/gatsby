# gatsby-plugin-sitemap

Create a sitemap for your Gatsby site.

## Install

`npm install --save gatsby-plugin-sitemap`

## How to Use

```javascript
// In your gatsby-config.js
siteMetadata: {
  siteUrl
},
plugins: [
  {
    resolve: `gatsby-plugin-sitemap`
  }
]
```

Above is the minmal configuration required to have it work, however, note that
the [default
query](https://github.com/gatsbyjs/gatsby/blob/1.0/packages/gatsby-plugin-sitemap/src/internals.js)
only retrieves nodes of type `MarkdownRemark`. Any parameter in
`defaultOptions` can be overridden.
