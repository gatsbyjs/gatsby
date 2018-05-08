---
title: "Adding search to your Gatsby website"
---

Before we go through the possibilities let's explain the components needed in order to have a searchable website.

- First component is the search index which is the data to facilitate fast and accurate information retrieval, The purpose of storing an index is to optimize speed and performance in finding relevant documents for a search query. Without an index, you would scan every document in the website which is very slow.

- Second component is a search engine that perform the search using the index component and returns the requested document based on a query

- The third and last component is the visual component i.e the ui that the user will use to type the query.

There are few ways to approach adding search to your Gatsby-powered site:

# Offline Search using an opensource library

Using open-source libraries like [elesticlunr](https://www.npmjs.com/package/elasticlunr) or [js-search](https://github.com/bvaughn/js-search) for offline search but doing so will require you to create a search index at build time. For elesticlunr there is a plugin called [gatsby-plugin-elasticlunr-search](https://github.com/andrew-codes/gatsby-plugin-elasticlunr-search) that does that automatically, for other library you can use a combination of [onCreateNode](https://www.gatsbyjs.org/docs/node-apis/#onCreateNode), [setFieldsOnGraphQLNodeType](https://www.gatsbyjs.org/docs/node-apis/#setFieldsOnGraphQLNodeType) and [sourceNodes](https://www.gatsbyjs.org/docs/node-apis/#sourceNodes) from the Gatsby node API to create the search index and make available in GraphQL. for more info on how todo this you checkout gatsby-plugin-elasticlunr-search [source code](https://github.com/andrew-codes/gatsby-plugin-elasticlunr-search/blob/master/src/gatsby-node.js#L88-L126).

After building the search index and including it in Gatsby's data layer you will need to allow the user to be able to search your website that can be done using a simple form with a search input that captures the search term and using one of the library mentionned above to retrieve the desired document.

You need to be careful with this approach because the entire search index has to be brought into the client which will affect the bundle size significantly.

# Using an API based Search engine

If you're building a website for your documentation, you can use the [Algolia](https://www.algolia.com/) [docs](https://www.algolia.com/doc/) feature it  scrapes the DOM and builds the search index automatically.

If your website does not qualify as documentation you need collect the search index at build time and upload it using [gatsby-plugin-algolia](https://github.com/algolia/gatsby-plugin-algolia)

For both cases you'll need to implement your own search experience but instead of having the search index embedded in the website and run the search client side you let algolia doing that for you and simply send the search term through their API.
algolia provides a [react library](https://github.com/algolia/react-instantsearch) to facilitate that.

This approach keeps your bundle size small since hosting the search index will be elsewhere but depends on the traffic to your website and the amount of search performed you might need to have a paid plan
