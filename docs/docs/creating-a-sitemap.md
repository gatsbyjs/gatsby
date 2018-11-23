---
title: Creating a sitemap
---

### What is a Site Map?

An [XML sitemap](https://support.google.com/webmasters/answer/156184?hl=en) lists a website’s important pages, making sure search engines (such as Google) can find and crawl them all, and helping it understand your website structure.

Think of it as a map for your website. It shows what all of the pages are on your website.

### Install

To generate an XML sitemap, you will use the [`gatsby-plugin-sitemap`](/packages/gatsby-plugin-sitemap/) package. To install this package, run the following line on your command line:
`npm install --save gatsby-plugin-sitemap`

### How to use [gatsby-plugin-sitemap](/packages/gatsby-plugin-sitemap/)

````javascript
```javascript:title=gatsby-config.js
siteMetadata: {
  siteUrl: `https://www.example.com`,
},
plugins: [`gatsby-plugin-sitemap`]
````

Above is the minimal configuration required to have it work. By default, the generated sitemap will include all of your site’s pages.

### Additonal Modification

Additonal modification steps are available in the [`gatsby-plugin-sitemap` documentation](https://www.gatsbyjs.org/packages/gatsby-plugin-sitemap)
