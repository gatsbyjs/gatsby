---
title: Page Creation
---

A page is created by calling the [createPage](/docs/actions/#createPage) action. There are two main side effects that occur when a page is created.

1. The `pages` redux namespace is updated
1. The `components` redux namespace is updated
1. `onCreatePage` API is executed

## Update Pages redux namespace

The `pages` redux namespace is a map of page `path` to page object. The [pages reducer](https://github.com/gatsbyjs/gatsby/blob/master/packages/gatsby/src/redux/reducers/pages.js) takes care of updating this on a `CREATE_PAGE` action. It also creates a [Foreign Key Reference](/docs/schema-gql-type/#foreign-key-reference-___node) to plugin that created the page by adding a `pluginCreator___NODE` field.

## Update Components redux namespace

The `components` redux namespace is a map of [componentPath](/docs/behind-the-scenes-terminology/#component) (file with React component) to the Component object. A Component object is simply the Page object but with an empty query string (that will be set during [Query Extraction](/docs/query-extraction/#store-queries-in-redux)).

## onCreatePage API

Every time a page is created, plugins have the opportunity to handle its [onCreatePage](/docs/node-apis/#onCreatePage) event. This is used for things like creating `SitePage` nodes in [Internal Data Bridge](/docs/internal-data-bridge/), and for "path" related plugins such as [gatsby-plugin-create-client-paths](/packages/gatsby-plugin-create-client-paths/) and [gatsby-plugin-remove-trailing-slashes](/packages/gatsby-plugin-remove-trailing-slashes/).
