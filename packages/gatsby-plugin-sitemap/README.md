# gatsby-plugin-sitemap

Create a sitemap for your Gatsby site.

## Install

`npm install --save gatsby-plugin-sitemap`

## How to Use

```javascript
// In your gatsby-config.js
siteMetadata: {
  siteUrl: `https://www.example.com`,
},
plugins: [
  {
    resolve: `gatsby-plugin-sitemap`
  }
]
```

Above is the minimal configuration required to have it work. By default, the
generated sitemap will include all of your site's pages except the dev 404 page
(`/dev-404-page/`).

The [default query](https://github.com/gatsbyjs/gatsby/blob/master/packages/gatsby-plugin-sitemap/src/internals.js#L16)
as well as any of the other `defaultOptions` [here](https://github.com/gatsbyjs/gatsby/blob/master/packages/gatsby-plugin-sitemap/src/internals.js#L15)
can be overridden - for example:

```javascript
// In your gatsby-config.js
siteMetadata: {
  siteUrl: `https://www.example.com`,
},
plugins: [
  {
    resolve: `gatsby-plugin-sitemap`,
    options: {
      output: `/some-other-sitemap.xml`,
      query: `
        {
          site {
            siteMetadata {
              siteUrl
            }
          }

          allSitePage {
            edges {
              node {
                path
              }
            }
          }
      }`
    }
  }
]
```

_NOTE: This plugin only generates output when run in `production` mode! To test your sitemap, run: `gatsby build && gatsby serve`_
