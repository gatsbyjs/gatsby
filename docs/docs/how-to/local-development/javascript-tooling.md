---
title: Javascript tooling
---

Gatsby offers support for the standard Javascript toolchain.

## Typescript

Gatsby supports [Typescript](https://www.typescriptlang.org/) automatically, with the [ability to modify the default configuration](/plugins/gatsby-plugin-typescript/) if desired.

## Bundling and transpilation

Gatsby uses [webpack](https://webpack.js.org/) to bundle files and [Babel](https://babeljs.io/) to transpile Javascript.

- [How to configure webpack](/docs/how-to/custom-configuration/add-custom-webpack-config/)
- [How to configure Babel](/docs/how-to/custom-configuration/babel/)

A number of Gatsby plugins already exist for relatively common tasks; you can install these in your `gatsby-config.js`.

## Linting and auto-formatting

Gatsby supports the use of [ESLint](https://www.gatsbyjs.com/docs/how-to/custom-configuration/eslint/) and [Prettier](https://prettier.io/) to enforce code styling standards.
