---
title: Gatsby Lifecycle APIs
---

Gatsby provides a rich set of lifecycle APIs to hook into Gatsby's bootstrap,
build, and client runtime operations.

Gatsby's design principles include:

- Conventions > code but use low-level primitives to build conventions with
  code.
- Extracting logic and configuration into [plugins](/docs/plugins/) should be
  trivial and encouraged.
- Plugins are easy to open source and reuse. They're just NPM packages.

# High level Overview

## Bootstrap sequence

During "bootstrap" gatsby:

- reads `gatsby-config.js` to load in your list of plugins
- initializes its cache (stored in `/.cache`)
- pulls in and preprocesses data ("source and transform nodes") into a GraphQL schema
- creates pages in memory
  - from your `/pages` folder 
  - from your `gatsby-node.js` if you implement `createPages`/`createPagesStatefully` (e.g. templates)
  - from any plugins that implement `createPages`/`createPagesStatefully`
- extracts, runs, and replaces graphql queries for pages and `StaticQuery`s
- writes out the pages to cache

In development this is a running process powered by [Webpack](https://github.com/gatsbyjs/gatsby/blob/dd91b8dceb3b8a20820b15acae36529799217ae4/packages/gatsby/package.json#L128) and [react-hot-loader](https://github.com/gatsbyjs/gatsby/blob/dd91b8dceb3b8a20820b15acae36529799217ae4/packages/gatsby/package.json#L104), so changes to any files get re-run through the sequence again, with smart cache invalidation.

The core of the bootstrap process is the "api-runner", which helps to execute APIs in sequence, with state managed in Redux. Gatsby exposes a number of lifecycle APIs which can either be implemented by you or any of your provided plugins in `gatsby-node.js`, `gatsby-browser.js` or `gatsby-ssr.js`. **The sequence of your plugins matter**, so if the output of one plugin depends on another you should be sure to reflect this in `gatsby-config.js`.

The sequence of the **main** bootstrap Node API lifecycles are:

- [onPreBootstrap](https://www.gatsbyjs.org/docs/node-apis/#onPreBootstrap) eg implemented by [gatsby-plugin-typography](https://github.com/gatsbyjs/gatsby/blob/06e4fccb1abc32ba29e878bb3de303afac390e4a/packages/gatsby-plugin-typography/src/gatsby-node.js)
- [sourceNodes](https://www.gatsbyjs.org/docs/node-apis/#sourceNodes) eg implemented by [gatsby-source-wikipedia](https://github.com/gatsbyjs/gatsby/blob/1fb19f9ad16618acdac7eda33d295d8ceba7f393/packages/gatsby-source-wikipedia/src/gatsby-node.js)
  - within this `createNode` can be called multiple times, which then triggers [onCreateNode](https://www.gatsbyjs.org/docs/node-apis/#onCreateNode).
- (the first schema build happens here)
- [resolvableExtensions](https://www.gatsbyjs.org/docs/node-apis/#resolvableExtensions) for filetype/language extensions eg [gatsby-plugin-typescript](https://github.com/gatsbyjs/gatsby/blob/1fb19f9ad16618acdac7eda33d295d8ceba7f393/packages/gatsby-plugin-typescript/src/gatsby-node.js)
- [createPages](https://www.gatsbyjs.org/docs/node-apis/#createPages) eg implemented by [page-hot-reloader](https://github.com/gatsbyjs/gatsby/blob/1fb19f9ad16618acdac7eda33d295d8ceba7f393/packages/gatsby/src/bootstrap/page-hot-reloader.js)
  - within this `createPage` can be called any number of times, which then triggers [onCreatePage](https://www.gatsbyjs.org/docs/node-apis/#onCreatePage)
- [onPreExtractQueries](https://www.gatsbyjs.org/docs/node-apis/#onPreExtractQueries) eg implemented by [gatsby-transformer-sharp](https://github.com/gatsbyjs/gatsby/blob/1fb19f9ad16618acdac7eda33d295d8ceba7f393/packages/gatsby-transformer-sharp/src/gatsby-node.js) and [gatsby-source-contentful](https://github.com/gatsbyjs/gatsby/blob/73523c39bba87869d802d8a3445279e42671efdb/packages/gatsby-source-contentful/src/gatsby-node.js)
- (schema update happens here)
- **extract queries from components** where the [queryCompiler](https://github.com/gatsbyjs/gatsby/blob/ffd8b2d691c995c760fe380769852bcdb26a2278/packages/gatsby/src/internal-plugins/query-runner/query-compiler.js#L189) replaces page GraphQL queries and `StaticQueries`
- The [queries are run](https://github.com/gatsbyjs/gatsby/blob/ffd8b2d691c995c760fe380769852bcdb26a2278/packages/gatsby/src/internal-plugins/query-runner/page-query-runner.js#L100), and the [pages are written out](https://github.com/gatsbyjs/gatsby/blob/ffd8b2d691c995c760fe380769852bcdb26a2278/packages/gatsby/src/internal-plugins/query-runner/pages-writer.js)
- [onPostBoostrap](https://www.gatsbyjs.org/docs/node-apis/#onPostBootstrap) is called (but it is not often used)

## Build sequence

(to be written)

## Client sequence

(to be written)

---

Please see the links along the left under "REFERENCE" for the full API documentation.
