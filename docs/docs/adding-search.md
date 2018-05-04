---
title: "Adding search to your website"
---

There are few ways to approach this.

1. Using Libraries like [elesticlunr][1] for offline search but it will require you to create the index at build time which is fortunately achievable using the [gatsby-plugin-elasticlunr-search][2] plugin

2. If your website type is documentation you can use [Algolia docs][3] feature. They will scrape the dom and build the search index automatically and then it's a matter of building the [search ui][4]

3. Using Algolia and collect the search index at build time and upload it to algolia and Guess what there is [plugin][5] for that.


  [1]: https://www.npmjs.com/package/elasticlunr
  [2]: https://github.com/andrew-codes/gatsby-plugin-elasticlunr-search
  [3]: https://www.algolia.com/doc/
  [4]: https://www.algolia.com/doc/paths/build-search-ui/
  [5]: https://github.com/algolia/gatsby-plugin-algolia
