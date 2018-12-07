---
title: Creating a sitemap
---

### What is a Sitemap?

An [XML sitemap](https://support.google.com/webmasters/answer/156184?hl=en) lists a website’s important pages, making sure search engines (such as Google) can find and crawl them all. In effect, a sitemap helps a search engine understand your website structure.

Think of it as a map for your website. It shows what all of the pages are on your website.

### Install

To generate an XML sitemap, you will use the [`gatsby-plugin-sitemap`](/packages/gatsby-plugin-sitemap/) package. To install this package, run the following command:
`npm install --save gatsby-plugin-sitemap`

### How to use [gatsby-plugin-sitemap](/packages/gatsby-plugin-sitemap/)

Once installation is complete, we can now add this plugin to our `gatsby-config.js`, like so:

```javascript:title=gatsby-config.js
module.exports = {
  siteMetadata: {
    siteUrl: `https://www.example.com`,
  },
  plugins: [`gatsby-plugin-sitemap`],
}
```

This is all that's required to get a working sitemap with Gatsby! By default, the generated sitemap will include all of your site’s pages, but of course the plugin exposes options to configure this default functionality.

### Additional Modification

Additional modification steps are available in the [`gatsby-plugin-sitemap` documentation](/packages/gatsby-plugin-sitemap)
