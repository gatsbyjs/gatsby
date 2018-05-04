---
title: "Adding search to your Gatsby website"
---

There are few ways to approach adding search to your Gatsby-powered site:

1. You can use libraries such as [elesticlunr][1] for offline search but doing so will require you to index at build time. Fortunately, this is achievable using the [gatsby-plugin-elasticlunr-search][2] plugin

2. If your building a website for your documentation, you can use the [Algolia docs][3] feature--it  scrapes the dom and builds the search index automatically. After that, you'll need to implement your own [search ui][4].

3. Use Algolia to collect the search index at build time and upload it to using [gatsby-plugin-algolia][5].


  [1]: https://www.npmjs.com/package/elasticlunr
  [2]: https://github.com/andrew-codes/gatsby-plugin-elasticlunr-search
  [3]: https://www.algolia.com/doc/
  [4]: https://www.algolia.com/doc/paths/build-search-ui/
  [5]: https://github.com/algolia/gatsby-plugin-algolia
