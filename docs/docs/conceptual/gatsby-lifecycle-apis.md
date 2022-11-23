---
title: Gatsby Lifecycle APIs
---

Gatsby provides a rich set of lifecycle APIs to hook into its bootstrap,
build, and client runtime operations.

Gatsby's design principles include:

- Conventions > code, but use low-level primitives to build conventions with
  code.
- Extracting logic and configuration into [plugins](/docs/plugins/) should be
  trivial and encouraged.
- Plugins are easy to open source and reuse. They're just npm packages.

## High level Overview

The following model gives a conceptual overview of how data is sourced and transformed in the process of building a Gatsby site:

<ComponentModel />

## Bootstrap sequence

During the main bootstrap sequence, Gatsby (in this order):

- reads and validates `gatsby-config.js` to load in your list of plugins (it doesn't run them yet).
- deletes HTML and CSS files from previous builds (public folder)
- initializes its cache (stored in `/.cache`) and checks if any plugins have been updated since the last run, if so it deletes the cache
- sets up `gatsby-browser` and `gatsby-ssr` for plugins that have them
- starts main bootstrap process
  - runs [onPreBootstrap](/docs/reference/config-files/gatsby-node/#onPreBootstrap). e.g. implemented by [`gatsby-plugin-typography`](https://github.com/gatsbyjs/gatsby/blob/master/packages/gatsby-plugin-typography/src/gatsby-node.js)
- runs [sourceNodes](/docs/reference/config-files/gatsby-node/#sourceNodes) e.g. implemented by [`gatsby-source-wikipedia`](https://github.com/gatsbyjs/gatsby/blob/master/packages/gatsby-source-wikipedia/src/gatsby-node.js)
  - within this, `createNode` can be called multiple times, which then triggers [onCreateNode](/docs/reference/config-files/gatsby-node/#onCreateNode)
- creates initial GraphQL schema
- runs [resolvableExtensions](/docs/reference/config-files/gatsby-node/#resolvableExtensions) which lets plugins register file types or extensions e.g. [`gatsby-plugin-typescript`](https://github.com/gatsbyjs/gatsby/blob/master/packages/gatsby-plugin-typescript/src/gatsby-node.js)
- runs [createPages](/docs/reference/config-files/gatsby-node/#createPages) from the gatsby-node.js in the root directory of the project e.g. implemented by [`page-hot-reloader`](https://github.com/gatsbyjs/gatsby/blob/master/packages/gatsby/src/bootstrap/page-hot-reloader.ts)
  - within this, `createPage` can be called any number of times, which then triggers [onCreatePage](/docs/reference/config-files/gatsby-node/#onCreatePage)
- runs [createPagesStatefully](/docs/reference/config-files/gatsby-node/#createPagesStatefully)
- runs source nodes again and updates the GraphQL schema to include pages this time
- runs [onPreExtractQueries](/docs/reference/config-files/gatsby-node/#onPreExtractQueries) e.g. implemented by [`gatsby-transformer-sharp`](https://github.com/gatsbyjs/gatsby/blob/master/packages/gatsby-transformer-sharp/src/gatsby-node.js) and [`gatsby-source-contentful`](https://github.com/gatsbyjs/gatsby/blob/master/packages/gatsby-source-contentful/src/gatsby-node.js), and extracts queries from pages and components (`useStaticQuery`)
- compiles GraphQL queries and creates the Abstract Syntax Tree (AST)
- runs query validation based on schema
- executes queries and stores their respective results
- writes page redirects (if any) to `.cache/redirects.json`
- the [onPostBootstrap](/docs/reference/config-files/gatsby-node/#onPostBootstrap) lifecycle is executed

In development this is a running process powered by [webpack](https://github.com/gatsbyjs/gatsby/blob/dd91b8dceb3b8a20820b15acae36529799217ae4/packages/gatsby/package.json#L128) and [`react-refresh`](https://github.com/gatsbyjs/gatsby/blob/4dff7550a29f4635bf47a068a05f634470eb9ef1/packages/gatsby/package.json#L134)), so changes to any files get re-run through the sequence again, with [smart cache invalidation](https://github.com/gatsbyjs/gatsby/blob/ffd8b2d691c995c760fe380769852bcdb26a2278/packages/gatsby/src/bootstrap/index.js#L141). For example, `gatsby-source-filesystem` watches files for changes, and each change triggers re-running queries. Other plugins may also perform this service. Queries are also watched, so if you modify a query, your development app is hot reloaded.

The core of the bootstrap process is the "api-runner", which helps to execute APIs in sequence, with state managed in Redux. Gatsby exposes a number of lifecycle APIs which can either be implemented by you (or any of your configured plugins) in `gatsby-node.js`, `gatsby-browser.js` or `gatsby-ssr.js`.

## Build sequence

(to be written)

## Client sequence

(to be written)

---

Please see the links along the left under "REFERENCE" for the full API documentation.
