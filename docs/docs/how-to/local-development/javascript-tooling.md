---
title: Javascript tooling
---

Gatsby offers support for the standard Javascript toolchain.

## TypeScript

Gatsby supports [TypeScript](https://www.typescriptlang.org/) automatically, with the [ability to modify the default configuration](/plugins/gatsby-plugin-typescript/) if desired. Gatsby also supports [GraphQL Typegen](/docs/how-to/local-development/graphql-typegen).

## Bundling and transpilation

Gatsby uses [webpack](https://webpack.js.org/) to bundle files and [Babel](https://babeljs.io/) to transpile Javascript.

- [How to configure webpack](/docs/how-to/custom-configuration/add-custom-webpack-config/)
- [How to configure Babel](/docs/how-to/custom-configuration/babel/)

Most sites work great with the default configuration. Many common changes have [Gatsby plugins](/plugins) already which you can install in your `gatsby-config.js`.

## Linting and auto-formatting

Gatsby supports the use of [ESLint](https://www.gatsbyjs.com/docs/how-to/custom-configuration/eslint/) and [Prettier](https://prettier.io/) to enforce code styling standards.
