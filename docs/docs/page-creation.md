---
title: Page Creation
---

A page is created by calling the [createPage](/docs/reference/config-files/actions/#createPage) action. There are three main side effects that occur when a page is created.

1. The `pages` Redux namespace is updated
2. The `components` Redux namespace is updated
3. `onCreatePage` API is executed

## Update pages Redux namespace

The `pages` Redux namespace is a map of page `path` to page object. The [pages reducer](https://github.com/gatsbyjs/gatsby/blob/master/packages/gatsby/src/redux/reducers/pages.ts) takes care of updating this on a `CREATE_PAGE` action. It also creates a [Foreign Key Reference](/docs/schema-gql-type/#foreign-key-reference-___node) to the plugin that created the page by adding a `pluginCreator___NODE` field.

## Update components Redux namespace

The `components` Redux namespace is a map of [componentPath](/docs/behind-the-scenes-terminology/#component) (file with React component) to the Component object. A Component object is the Page object but with an empty query string (that will be set during [Query Extraction](/docs/query-extraction/#store-queries-in-redux)).

## onCreatePage API

Every time a page is created, plugins have the opportunity to handle its [onCreatePage](/docs/reference/config-files/gatsby-node/#onCreatePage) event. This is used for things like creating `SitePage` nodes in [Internal Data Bridge](/docs/internal-data-bridge/), and for "path" related plugins such as [gatsby-plugin-create-client-paths](/plugins/gatsby-plugin-create-client-paths/) and [gatsby-plugin-remove-trailing-slashes](/plugins/gatsby-plugin-remove-trailing-slashes/).
