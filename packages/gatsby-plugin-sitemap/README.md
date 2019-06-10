# gatsby-plugin-sitemap

Create a sitemap for your Gatsby site.

_NOTE: This plugin only generates output when run in `production` mode! To test your sitemap, run: `gatsby build && gatsby serve`_

## Install

`npm install --save gatsby-plugin-sitemap`

## How to Use

```javascript
// In your gatsby-config.js
siteMetadata: {
  siteUrl: `https://www.example.com`,
},
plugins: [`gatsby-plugin-sitemap`]
```

Above is the minimal configuration required to have it work. By default, the
generated sitemap will include all of your site's pages, except the ones you exclude.

## Options

The `defaultOptions` [here](https://github.com/gatsbyjs/gatsby/blob/master/packages/gatsby-plugin-sitemap/src/internals.js#L34) can be overridden.

We _ALWAYS_ exclude the following pages: `/dev-404-page/`,`/404` &`/offline-plugin-app-shell-fallback/`, this cannot be changed.

Example:

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
      // Exclude specific pages or groups of pages using glob parameters
      // See: https://github.com/isaacs/minimatch
      // The example below will exclude the single `path/to/page` and all routes beginning with `category`
      exclude: ["/category/*", `/path/to/page`],
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

## Sitemap Index

We also support generating `sitemap index`.

- [Split up your large sitemaps](https://support.google.com/webmasters/answer/75712?hl=en)
- [Using Sitemap index files (to group multiple sitemap files)](https://www.sitemaps.org/protocol.html#index)

```javascript
// In your gatsby-config.js
siteMetadata: {
  siteUrl: `https://www.example.com`,
},
plugins: [
  {
    resolve: `gatsby-plugin-sitemap`,
    options: {
      sitemapSize: 5000
    }
  }
]
```

Above is the minimal configuration to split large sitemap.
When number of URL in sitemap is more than 5000 plugin will create sitemap (e.g. `sitemap-0.xml`, `sitemap-1.xml`) and index (e.g. `sitemap.xml`) files.
