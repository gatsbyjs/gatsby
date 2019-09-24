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

# High level Overview

The following model gives a conceptual overview of how data is sourced and transformed in the process of building a Gatsby site:

<LayerModel />

## Bootstrap sequence

During "bootstrap" Gatsby:

- reads `gatsby-config.js` to load in your list of plugins
- initializes its cache (stored in `/.cache`)
- pulls in and preprocesses data ("source and transform nodes") into a GraphQL schema
- creates pages in memory
  - from your `/pages` folder
  - from your `gatsby-node.js` if you implement `createPages`/`createPagesStatefully` (e.g. templates)
  - from any plugins that implement `createPages`/`createPagesStatefully`
- extracts, runs, and replaces graphql queries for pages and `StaticQuery`s
- writes out the pages to cache

In development this is a running process powered by [Webpack](https://github.com/gatsbyjs/gatsby/blob/dd91b8dceb3b8a20820b15acae36529799217ae4/packages/gatsby/package.json#L128) and [`react-hot-loader`](https://github.com/gatsbyjs/gatsby/blob/dd91b8dceb3b8a20820b15acae36529799217ae4/packages/gatsby/package.json#L104), so changes to any files get re-run through the sequence again, with [smart cache invalidation](https://github.com/gatsbyjs/gatsby/blob/ffd8b2d691c995c760fe380769852bcdb26a2278/packages/gatsby/src/bootstrap/index.js#L141). For example, `gatsby-source-filesystem` watches files for changes, and each change triggers re-running queries. Other plugins may also perform this service. Queries are also watched, so if you modify a query, your development app is hot reloaded.

The core of the bootstrap process is the "api-runner", which helps to execute APIs in sequence, with state managed in Redux. Gatsby exposes a number of lifecycle APIs which can either be implemented by you (or any of your configured plugins) in `gatsby-node.js`, `gatsby-browser.js` or `gatsby-ssr.js`.

The sequence of the **main** bootstrap Node API lifecycles are:

- [onPreBootstrap](/docs/node-apis/#onPreBootstrap) e.g. implemented by [`gatsby-plugin-typography`](https://github.com/gatsbyjs/gatsby/blob/master/packages/gatsby-plugin-typography/src/gatsby-node.js)
- [sourceNodes](/docs/node-apis/#sourceNodes) e.g. implemented by [`gatsby-source-wikipedia`](https://github.com/gatsbyjs/gatsby/blob/master/packages/gatsby-source-wikipedia/src/gatsby-node.js)
  - within this `createNode` can be called multiple times, which then triggers [onCreateNode](/docs/node-apis/#onCreateNode).
- (the first schema build happens here)
- [resolvableExtensions](/docs/node-apis/#resolvableExtensions) for filetype/language extensions e.g. [`gatsby-plugin-typescript`](https://github.com/gatsbyjs/gatsby/blob/master/packages/gatsby-plugin-typescript/src/gatsby-node.js)
- [createPages](/docs/node-apis/#createPages) e.g. implemented by [`page-hot-reloader`](https://github.com/gatsbyjs/gatsby/blob/master/packages/gatsby/src/bootstrap/page-hot-reloader.js)
  - within this `createPage` can be called any number of times, which then triggers [onCreatePage](/docs/node-apis/#onCreatePage)
- [onPreExtractQueries](/docs/node-apis/#onPreExtractQueries) e.g. implemented by [`gatsby-transformer-sharp`](https://github.com/gatsbyjs/gatsby/blob/master/packages/gatsby-transformer-sharp/src/gatsby-node.js) and [`gatsby-source-contentful`](https://github.com/gatsbyjs/gatsby/blob/master/packages/gatsby-source-contentful/src/gatsby-node.js)
- (schema update happens here)
- **extract queries from components** where the [queryCompiler](https://github.com/gatsbyjs/gatsby/blob/6de0e4408e14e599d4ec73948eb4153dc3cde849/packages/gatsby/src/internal-plugins/query-runner/query-compiler.js#L189) replaces page GraphQL queries and `StaticQueries`
- The [queries are run](https://github.com/gatsbyjs/gatsby/blob/6de0e4408e14e599d4ec73948eb4153dc3cde849/packages/gatsby/src/internal-plugins/query-runner/page-query-runner.js#L120), and the [pages are written out](https://github.com/gatsbyjs/gatsby/blob/master/packages/gatsby/src/internal-plugins/query-runner/pages-writer.js)
- [onPostBootstrap](/docs/node-apis/#onPostBootstrap) is called (but it is not often used)

## Build sequence

(to be written)

## Client sequence

(to be written)

---

Please see the links along the left under "REFERENCE" for the full API documentation.
