---
title: Creating a sitemap
---

A sitemap can help web crawlers and search engines to quickly determine the pages that exist on your site. `gatsby-plugin-sitemap` is a plugin that automatically generates a sitemap for you during `gatsby build`.

## Install gatsby-plugin-sitemap

`npm install --save gatsby-plugin-sitemap`

## How to Use

```javascript{3,6}:title=gatsby-config.js
module.exports = {
  siteMetadata: {
	siteUrl: `https://www.example.com`,
  },
  plugins: [
    `gatsby-plugin-sitemap`
  ]
}
```

Above is the minimal configuration required to have it work. By default, the
generated sitemap will include all of your site's pages, except the ones you exclude.

Additional configuration options can be found in [`gatsby-plugin-sitemap` documentation](https://www.gatsbyjs.org/packages/gatsby-plugin-sitemap).
