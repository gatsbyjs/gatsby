---
title: "Adding search"
---

Before we go through the steps for adding search to your Gatsby website, let's examine the components needed for adding search to a website.

There are three required components for adding search to your Gatsby website:

1.  index
2.  engine
3.  UI

## Site search components

### Search index

The search index is a copy of your data stored in a search-friendly format. An index is for optimizing speed and performance when executing a search query. Without an index, every search would need to scan every page in your site—which quickly becomes inefficient.

### Search engine

The search engine takes a search query, runs it through the search index, and returns any matching documents.

### Search UI

The UI component provides an interface to the user, which allows them to write search queries and view the results of each query.

## Adding search to your site

Now that you know the three required components, there are a few ways to approach adding search to your Gatsby-powered site.

### Use an open source search engine

Using an open source search engine is always free and allows you to enable offline search for your site. Note that you need to be careful with offline search because the entire search index has to be brought into the client, which can affect the bundle size significantly.

Open source libraries like [`elasticlunr`](https://www.npmjs.com/package/elasticlunr) or [`js-search`](https://github.com/bvaughn/js-search) can be used to enable search for your site.

Doing so will require you to create a search index when your site is built. For `elesticlunr`, there is a plugin called [`gatsby-plugin-elasticlunr-search`](https://github.com/andrew-codes/gatsby-plugin-elasticlunr-search) that creates a search index automatically.

For other libraries, you can use a combination of [`onCreateNode`](https://www.gatsbyjs.org/docs/node-apis/#onCreateNode), [`setFieldsOnGraphQLNodeType`](https://www.gatsbyjs.org/docs/node-apis/#setFieldsOnGraphQLNodeType) and [`sourceNodes`](https://www.gatsbyjs.org/docs/node-apis/#sourceNodes) from the Gatsby node API to create the search index and make it available in GraphQL. For more info on how to do this check out [`gatsby-plugin-elasticlunr-search`'s source code](https://github.com/andrew-codes/gatsby-plugin-elasticlunr-search/blob/master/src/gatsby-node.js#L88-L126).

Another option is to generate the search index at the end of the build using the [`onPostBuild`](https://www.gatsbyjs.org/docs/node-apis/#onPostBuild) node API. This approach is used by [`gatsby-plugin-lunr`](https://github.com/humanseelabs/gatsby-plugin-lunr) to build a multilanguage index.

After building the search index and including it in Gatsby's data layer, you will need to allow the user to search your website. This is typically done by using a text input to capture the search query, then using one of the libraries mentioned above to retrieve the desired document(s).

### Use an API-based search engine

Another option is to use an external search engine. This solution is much more scalable as visitors to your site don't have to download your entire search index (which becomes very large as your site grows) in order to search your site. The trade-off is you'll need to pay for hosting the search engine or pay for a commercial search service.

There are many available both open source that you can host yourself and commercial hosted options.

- [ElasticSearch](https://www.elastic.co/products/elasticsearch) — OSS and has commercial hosting available
- [Solr](http://lucene.apache.org/solr/) — OSS and has commercial hosting available
- [Algolia](https://www.algolia.com/) — Commercial

If you're building a documentation website you can use [Algolia's DocSearch feature](https://community.algolia.com/docsearch/). It will automatically create a search index from the content of your pages.

If your website does not qualify as documentation, you need to collect the search index at build time and upload it using [`gatsby-plugin-algolia`](https://github.com/algolia/gatsby-plugin-algolia).

When using Algolia, they host the search index and search engine for you. Your search queries will be sent to their servers which will respond with any results. You'll need to implement your own UI; Algolia provides a [React library](https://github.com/algolia/react-instantsearch) which may have components you'd like to use.

Elasticsearch has several React component libraries for search e.g. https://github.com/appbaseio/reactivesearch
