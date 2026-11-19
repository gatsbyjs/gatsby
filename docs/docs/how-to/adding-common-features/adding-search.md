---
title: Adding Search
---

There are three required components for adding search to your Gatsby website: the **search index**, the **search engine**, and **search UI**.

## Site search components

| Search Component  | Description                                                                                                                                                                                                                                                              |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Search index**  | The search index is a copy of your data stored in a search-friendly format. An index is for optimizing speed and performance when executing a search query. Without an index, every search would need to scan every page in your site—which quickly becomes inefficient. |
| **Search engine** | The search engine indexes your content, takes a search query, runs it through the index, and returns any matching documents. Search engines can be hosted services (like Algolia) or open-source that you can self-host (like Elastic)                                   |
| **Search UI**     | A UI component on your site that allows users to write search queries and view the results of each query. Some search providers provide out of the box React components that you can drop into Gatsby sites.                                                             |

## Adding search to your site

There are a few ways to approach adding search to your Gatsby-powered site.

### Client-side search

It is possible to do all the work in your Gatsby site without needing a third-party solution. This involves writing a bit of code, but using less services. With large amounts of content to index, it can also increase the bundle size significantly.

One way of doing this is to use the `js-search` library:

- [Adding Search with JS Search](/docs/adding-search-with-js-search)

There are two Gatsby plugins that support this as well:

- [gatsby-plugin-elasticlunr-search](/plugins/@gatsby-contrib/gatsby-plugin-elasticlunr-search)
- [gatsby-plugin-local-search](/plugins/gatsby-plugin-local-search)

### Use an API-based search engine

Another option is to use an external search engine. This solution is much more scalable as visitors to your site don't have to download your entire search index (which becomes very large as your site grows) in order to search your site. The trade-off is you'll need to pay for hosting the search engine or pay for a commercial search service.

There are many options available, including both self-hosted and commercially hosted open source:

- [Algolia](https://www.algolia.com/) — SaaS, [has Gatsby plugin](/plugins/gatsby-plugin-algolia/)
- [ElasticSearch](https://www.elastic.co/products/elasticsearch) — OSS, commercial hosting available
- [Solr](https://solr.apache.org) — OSS and has commercial hosting available
- [Meilisearch](https://www.meilisearch.com/) - OSS, [has Gatsby plugin](/plugins/gatsby-plugin-meilisearch/)
- [Typesense](https://typesense.org/) - OSS, [has hosted version](https://cloud.typesense.org), [has Gatsby plugin](/plugins/gatsby-plugin-typesense/)

#### Algolia 

Algolia is a commercial search solution (with free tiers) that hosts the search index and search engine for you. It allows for advanced search features like events, analytics, recommendations, personalization, and more. Your search queries will be sent to their servers which will respond with any results. For UI components, Algolia provides a various libraries out of the box such as [InstantSearch](https://www.algolia.com/doc/guides/building-search-ui/what-is-instantsearch/js/) and [AutoComplete](https://www.algolia.com/doc/ui-libraries/autocomplete/introduction/what-is-autocomplete/), or you can build your own from scratch and use the [REST APIs](https://www.algolia.com/doc/api-reference/rest-api/). 

*Free For Public Technical Docs*

If you're building a public technical documentation website you can use [Algolia DocSearch](https://docsearch.algolia.com/). It will automatically create a search index from the content of your pages using a [crawler](https://docsearch.algolia.com/docs/record-extractor) and you can use the [DocSearch UI](https://docsearch.algolia.com/docs/docsearch-v3) out of the box.

*InDepth Guide*

To dive deeper into adding Algolia to your site, see [Adding search with Algolia](/docs/adding-search-with-algolia).

#### ElasticSearch
Elasticsearch also has several React component libraries for search, such as [ReactiveSearch](https://github.com/appbaseio/reactivesearch).
