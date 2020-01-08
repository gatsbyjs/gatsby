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

The `defaultOptions` [here](https://github.com/gatsbyjs/gatsby/blob/master/packages/gatsby-plugin-sitemap/src/internals.js#L45) can be overridden.

The options are as follows:

- `query` (GraphQL Query) The query for the data you need to generate the sitemap. It's required to get the `site.siteMetadata.siteUrl`. If you override the query, you probably will need to set a `serializer` to return the correct data for the sitemap.
- `output` (string) The filepath and name. Defaults to `/sitemap.xml`.
- `exclude` (array of strings) An array of paths to exclude from the sitemap.
- `createLinkInHead` (boolean) Whether to populate the `<head>` of your site with a link to the sitemap.
- `serialize` (function) Takes the output of the data query and lets you return an array of sitemap entries.

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
      }`,
      serialize: ({ site, allSitePage }) =>
        allSitePage.edges.map(edge => {
          return {
            url: site.siteMetadata.siteUrl + edge.node.path,
            changefreq: `daily`,
            priority: 0.7,
          }
        })
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

Above is the minimal configuration to split a large sitemap.
When the number of URLs in a sitemap is more than 5000, the plugin will create sitemap (e.g. `sitemap-0.xml`, `sitemap-1.xml`) and index (e.g. `sitemap.xml`) files.
