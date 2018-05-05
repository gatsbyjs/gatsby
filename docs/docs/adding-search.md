---
title: "Adding search to your Gatsby website"
---

There are few ways to approach adding search to your Gatsby-powered site:

1. You can use libraries such as [elesticlunr](https://www.npmjs.com/package/elasticlunr) for offline search but doing so will require you to index at build time. Fortunately, this is achievable using the [gatsby-plugin-elasticlunr-search](https://github.com/andrew-codes/gatsby-plugin-elasticlunr-search) plugin.

2. If you're building a website for your documentation, you can use the [Algolia docs](https://www.algolia.com/doc/) feature--it  scrapes the DOM and builds the search index automatically. After that, you'll need to implement your own [search UI](https://www.algolia.com/doc/paths/build-search-ui/).

3. Use Algolia to collect the search index at build time and upload it using [gatsby-plugin-algolia](https://github.com/algolia/gatsby-plugin-algolia).
