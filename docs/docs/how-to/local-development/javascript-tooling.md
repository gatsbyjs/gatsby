---
title: Javascript tooling
---

Gatsby offers support for the standard Javascript toolchain.

## Typescript

Gatsby supports Typescript automatically, with the [ability to modify the default configuration](gatsby-plugin-typescript/) if desired.

## Bundling and transpilation

Gatsby uses webpack to bundle files and Babel to transpile Javascript.

Gatsby ships with a default configuration that should work well for most projects, but if you want to modify it to load dependencies differently, use custom relative paths, include specific polyfills, or other customizations, you can [add custom webpack config](/docs/how-to/custom-configuration/add-custom-webpack-config/) and/or [use a custom .babelrc](/docs/how-to/custom-configuration/babel/)

## Linting and auto-formatting

Gatsby supports the use of [ESLint](https://www.gatsbyjs.com/docs/how-to/custom-configuration/eslint/) and Prettier to enforce code styling standards.
