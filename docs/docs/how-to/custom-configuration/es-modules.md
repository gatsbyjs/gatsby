---
title: ES Modules (ESM) and Gatsby
examples:
  - label: Using MDX
    href: "https://github.com/gatsbyjs/gatsby/tree/master/examples/using-mdx"
---

## Introduction

The ECMAScript module (ESM) format is the [official TC39 standard](https://tc39.es/ecma262/#sec-modules) for packaging JavaScript. For many years, [CommonJS (CJS)](https://nodejs.org/api/modules.html#modules-commonjs-modules) was the de facto standard in Node.js. You can author [`gatsby-config`](/docs/reference/config-files/gatsby-config/) and [`gatsby-node`](/docs/reference/config-files/gatsby-node/) in ESM syntax.

This feature was added in `gatsby@5.3.0`.

## Prerequisites

- A Gatsby project set up with `gatsby@5.3.0` or later. (Need help creating one? Follow the [Quick Start](/docs/quick-start/))

## Usage in Gatsby

Generally speaking you need to follow the official standard as explained in the [Node.js documentation](https://nodejs.org/api/esm.html).

### `gatsby-config`

Create a `gatsby-config.mjs` file. Here's an example `gatsby-config` using ESM syntax:

```js:title=gatsby-config.mjs
const config = {
  siteMetadata: {
    title: `ESM in Gatsby`,
  },
}

export default config
```

### `gatsby-node`

Create a `gatsby-node.mjs` file and use any of the [Node APIs](/docs/reference/config-files/gatsby-node/) as usual. Here's an example `gatsby-node` using ESM syntax:

```js:title=gatsby-node.mjs
export const onPostBuild = () => {
  console.log("Build is done!")
}
```

## Migrating from CommonJS to ES Modules

The documents [Interopability with CommonJS](https://nodejs.org/api/esm.html#interoperability-with-commonjs) and [Differences between ES Modules and CommonJS](https://nodejs.org/api/esm.html#differences-between-es-modules-and-commonjs) also apply to ESM in Gatsby.

## Current limitations

- The TypeScript variants of `gatsby-config` and `gatsby-node` do **not** support ESM yet. We plan on adding support in a future minor release by using the `.mts` extension. If you have questions or suggestions about this, please go to our [ESM in Gatsby files](https://github.com/gatsbyjs/gatsby/discussions/37069) umbrella discussion.

  However, you can use [Type Hinting](/docs/how-to/custom-configuration/typescript/#type-hinting-in-js-files) in the meantime.

The [ESM in Gatsby files](https://github.com/gatsbyjs/gatsby/discussions/37069) umbrella discussion is also the right place for any questions about the `.mjs` usage.
