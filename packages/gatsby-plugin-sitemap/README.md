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

## Recomended usage

## Options

The `defaultOptions` [here](https://github.com/gatsbyjs/gatsby/blob/master/packages/gatsby-plugin-sitemap/src/internals.js#L13) can be overridden.

The options are as follows:

- `output` (string) Folder path where sitemaps are stored. Defaults to `/sitemap`.
- `createLinkInHead` (boolean) Whether to populate the `<head>` of your site with a link to the sitemap.
- `entryLimit` (number) Number of entries per sitemap file, a sitemap index and multiple sitemaps are created if you have more entries.
- `exclude` (array of strings) An array of paths to exclude from the sitemap. While this is usually an array of strings it is possible to enter other data types into this array for custom filtering. Doing so will require customization of the `filterPages` function.
- `query` (GraphQL Query) The query for the data you need to generate the sitemap. It's required to get the site's URL, if you are not fetching it from `site.siteMetadata.siteUrl`, you will need to set a custom `resolveSiteUrl` function. If you override the query, you may need to pass in a custom `resolvePagePath`, `resolvePages` to keep everything working. If you fetch pages without using `allSitePage.nodes` query structure you will need to customize the `resolvePages` funciton.
- `resolveSiteUrl` (function) Takes the output of the data query and lets you return the site URL.
- `resolvePagePath` (function) Takes a page object and returns the uri of the page (no domain or protocol).
- `resolvePages` (function) Takes the output of the data query and expects an array of page objects to be returned.
- `filterPages` (function) Takes the current page a string (or other object) from the `excludes` array and expects a boolean to be returned. `true` excludes the path, `false` keeps it.
- `serialize` (function) Takes the output of the data query and lets you return an array of sitemap entries.

We _ALWAYS_ exclude the following pages: `/dev-404-page`,`/404` &`/offline-plugin-app-shell-fallback`, this cannot be changed enven by customizing the filterPages function.

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
      output: `/sitemaps/`,
      // Exclude specific pages or groups of pages using glob parameters
      // See: https://github.com/isaacs/minimatch
      // The example below will exclude the single `path/to/page` and all routes beginning with `category`
      exclude: [`/category/*`, `/path/to/page`],
      query: `
        {
          wp {
            generalSettings {
              siteUrl
            }
          }

          allSitePage {
            nodes {
              path
            }
          }
      }`,
      resolveSiteUrl: (data) => {
        return data.wp.generalSettings.siteUrl
        //Alternativly, you may ignore data and pass in an any variable from the begining of your `gatsby-config.js`.
        // eg. ABOVE: const cmsUrl = process.env.CMS_URL
        // return cmsUrl
      },
      serialize: (page, siteUrl, {resolvePagePath}) =>
        allSitePage.nodes.map(node => {
          return {
            url: `${siteUrl}${resolvePagePath(page)}`,
            changefreq: `daily`,
            priority: 0.7,
          }
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
      entryLimit: 5000
    }
  }
]
```

When the number of URLs in a sitemap is more than 5000 (defaults to 45k), the plugin will create sitemap (e.g. `sitemap-0.xml`, `sitemap-1.xml`) and index (e.g. `sitemap-index.xml`) files.
