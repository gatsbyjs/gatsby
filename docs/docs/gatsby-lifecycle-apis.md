---
title: Gatsby Lifecycle APIs
---

import LayerModel from "../../www/src/components/layer-model"

Gatsby provides a rich set of lifecycle APIs to hook into its bootstrap,
build, and client runtime operations.

Gatsby's design principles include:

- Conventions > code, but use low-level primitives to build conventions with
  code.
- Extracting logic and configuration into [plugins](/docs/plugins/) should be
  trivial and encouraged.
- Plugins are easy to open source and reuse. They're just NPM packages.

## High level Overview

The following model gives a conceptual overview of how data is sourced and transformed in the process of building a Gatsby site:

<LayerModel />

## Bootstrap sequence

During the main bootstrap sequence Gatsby (in this order):

- reads and validates `gatsby-config.js` to load in your list of plugins (it doesn't run them yet).
- deletes HTML and CSS files from the previous build (public folder)
- initializes its cache (stored in `/.cache`) and checks if any plugins have been updated since the last run, if so it deletes the cache
- runs the plugins
- starts main bootstrap process
  - runs [onPreBootstrap](/docs/node-apis/#onPreBootstrap). e.g. implemented by [`gatsby-plugin-typography`](https://github.com/gatsbyjs/gatsby/blob/master/packages/gatsby-plugin-typography/src/gatsby-node.js)
- runs [sourceNodes](/docs/node-apis/#sourceNodes) e.g. implemented by [`gatsby-source-wikipedia`](https://github.com/gatsbyjs/gatsby/blob/master/packages/gatsby-source-wikipedia/src/gatsby-node.js)
  - within this `createNode` can be called multiple times, which then triggers [onCreateNode](/docs/node-apis/#onCreateNode)
- creates the first GraphQL Schema
- runs [resolvableExtensions](/docs/node-apis/#resolvableExtensions) for filetype/language extensions e.g. [`gatsby-plugin-typescript`](https://github.com/gatsbyjs/gatsby/blob/master/packages/gatsby-plugin-typescript/src/gatsby-node.js)
- runs [createPages](/docs/node-apis/#createPages) from the gatsby-node.js in the root directory of the project e.g. implemented by [`page-hot-reloader`](https://github.com/gatsbyjs/gatsby/blob/master/packages/gatsby/src/bootstrap/page-hot-reloader.js)
  - within this `createPage` can be called any number of times, which then triggers [onCreatePage](/docs/node-apis/#onCreatePage)
- runs [createPagesStatefully](/docs/node-apis/#createPagesStatefully)
- runs source nodes again and it updates the GraphQL schema since pages can include queries to other data. Notice this is the second time source nodes run due to a "chicken and the egg problem". We need the pages to extract the queries but we need to create the schema first which requires to source nodes
- runs [onPreExtractQueries](/docs/node-apis/#onPreExtractQueries) e.g. implemented by [`gatsby-transformer-sharp`](https://github.com/gatsbyjs/gatsby/blob/master/packages/gatsby-transformer-sharp/src/gatsby-node.js) and [`gatsby-source-contentful`](https://github.com/gatsbyjs/gatsby/blob/master/packages/gatsby-source-contentful/src/gatsby-node.js), and extracts queries from pages and components (`StaticQuery`)
- compiles queries using a Relay compiler and creates the AST
- applies validation rules in the schema
- runs queries, stores result, and updates references to this result
- writes redirects
- [onPostBootstrap](/docs/node-apis/#onPostBootstrap) is called (but it is not often used)

In development this is a running process powered by [Webpack](https://github.com/gatsbyjs/gatsby/blob/dd91b8dceb3b8a20820b15acae36529799217ae4/packages/gatsby/package.json#L128) and [`react-hot-loader`](https://github.com/gatsbyjs/gatsby/blob/dd91b8dceb3b8a20820b15acae36529799217ae4/packages/gatsby/package.json#L104), so changes to any files get re-run through the sequence again, with [smart cache invalidation](https://github.com/gatsbyjs/gatsby/blob/ffd8b2d691c995c760fe380769852bcdb26a2278/packages/gatsby/src/bootstrap/index.js#L141). For example, `gatsby-source-filesystem` watches files for changes, and each change triggers re-running queries. Other plugins may also perform this service. Queries are also watched, so if you modify a query, your development app is hot reloaded.

The core of the bootstrap process is the "api-runner", which helps to execute APIs in sequence, with state managed in Redux. Gatsby exposes a number of lifecycle APIs which can either be implemented by you (or any of your configured plugins) in `gatsby-node.js`, `gatsby-browser.js` or `gatsby-ssr.js`.

## Build sequence

(to be written)

## Client sequence

(to be written)

---

Please see the links along the left under "REFERENCE" for the full API documentation.
