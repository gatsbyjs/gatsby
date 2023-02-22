---
date: "2022-12-13"
version: "5.3.0"
title: "v5.3 Release Notes"
---

Welcome to `gatsby@5.3.0` release (December 2022 #1)

Key highlights of this release:

- [ES Modules (ESM) in Gatsby files](#es-modules-esm-in-gatsby-files)
- [Improved error messages](#improved-error-messages)

Also check out [notable bugfixes](#notable-bugfixes--improvements).

**Bleeding Edge:** Want to try new features as soon as possible? Install `gatsby@next` and let us know if you have any [issues](https://github.com/gatsbyjs/gatsby/issues).

[Previous release notes](/docs/reference/release-notes/v5.2)

[Full changelog][full-changelog]

---

## ES Modules (ESM) in Gatsby files

The ECMAScript module (ESM) format is the [official TC39 standard](https://tc39.es/ecma262/#sec-modules) for packaging JavaScript. For many years, [CommonJS (CJS)](https://nodejs.org/api/modules.html#modules-commonjs-modules) was the de facto standard in Node.js. Before now, [`gatsby-config`](/docs/reference/config-files/gatsby-config/) and [`gatsby-node`](/docs/reference/config-files/gatsby-node/) had to be written in CJS. Earlier this year, we also included [support for TypeScript](/docs/how-to/custom-configuration/typescript/), allowing you to author your `gatsby-*` files in TypeScript.

Support for ESM in `gatsby-config` and `gatsby-node` files has been a highly requested feature in the community, and ecosystems that Gatsby interacts with like MDX and unified have switched to ESM, dropping CJS in their latest major releases. In this release, we've included support for ESM in `gatsby-node.mjs` and `gatsby-config.mjs`. This means that you can now use ESM-only packages without any workarounds. Here's an example `gatsby-config.mjs` file:

```js:title=gatsby-config.mjs
// The latest version of "slugify" is ESM-only
import slugify from "@sindresorhus/slugify"

const title = `Gatsby Default Starter`

const config = {
  siteMetadata: {
    title,
    slugifiedTitle: slugify(title),
  },
  plugins: [],
}

export default config
```

**Please note:** The TypeScript variants of `gatsby-config` and `gatsby-node` do **not** support ESM yet. We plan on adding support in a future minor release by using the `.mts` extension. If you have questions or suggestions about this, please go to our [ESM in Gatsby files](https://github.com/gatsbyjs/gatsby/discussions/37069) umbrella discussion.

The [ESM in Gatsby files](https://github.com/gatsbyjs/gatsby/discussions/37069) umbrella discussion is also the right place for any questions about the `.mjs` usage.

## Improved error messages

### Show original stack trace from workers

You might have run into an error like this while using Gatsby:

```shell
ERROR #85928

An error occurred during parallel query running.

Error: Worker exited before finishing task
```

Gatsby uses [child processes](https://nodejs.org/docs/latest-v18.x/api/child_process.html) to execute its GraphQL queries in parallel (with its own package [`gatsby-worker`](https://github.com/gatsbyjs/gatsby/tree/master/packages/gatsby-worker)). When Parallel Query Running was introduced these child processes were already instructed to propagate their errors to the main process so that you can see what actually happened. Unfortunately, at a certain workload the child processes didn't have enough time to relay those messages and you were left alone with the above mentioned worker error.

In the PR [feat(gatsby-worker): Show original stack trace](https://github.com/gatsbyjs/gatsby/pull/37206) we have now given `gatsby-worker` the ability to save its errors to a local, temporary file and then the main process can playback any messages that otherwise might have been lost. We have further plans to improve this functionality but the main pain point was fixed with the above PR. You should now successfully see the original error, with any amount of workload.

### Improve readability of errors & warnings

When you saw the error "Building static HTML failed for path ..." or the warning "This query took more than 15s to run..." Gatsby printed the complete contents of the page data to the terminal. The intentation behind that was to give you enough context to fix the error yourself. But since this also included the GraphQL results those logs could get verbose really quickly. In the [PR #37220](https://github.com/gatsbyjs/gatsby/pull/37220) this was fixed by removing properties from the page data, including the GraphQL results before printing them out. In normal circumstances the errors thrown by GraphQL or Gatsby itself will give you enough details to solve your error.

### Improved error during Gatsby Preview

When you use [Gatsby Preview](/products/cloud/previews/) and your site errors out on rendering the HTML, you'll now see an improved overlay. The [PR #37195](https://github.com/gatsbyjs/gatsby/pull/37195) improved the CSS styling, made it clearer what the error is and how to fix it, and added clearer structure to the overlay itself.

## Notable bugfixes & improvements

- `gatsby-plugin-image`: Ensure cache hash is unique, via [PR #37087](https://github.com/gatsbyjs/gatsby/pull/37087)
- `gatsby`:
  - Add `documentSearchPaths` option to `graphqlTypegen`, via [PR #37120](https://github.com/gatsbyjs/gatsby/pull/37120)
  - Materialize nodes in `gatsbyPath`, via [PR #37111](https://github.com/gatsbyjs/gatsby/pull/37111)
- `gatsby-plugin-utils`: Add `pathPrefix` to Image CDN URLs, via [PR #36772](https://github.com/gatsbyjs/gatsby/pull/36772)
- Miscellaneous dependency updates:
  - Update `sharp` from 0.30.7 to 0.31.2, via [PR #37131](https://github.com/gatsbyjs/gatsby/pull/37131)
  - Update `parcel` from 2.6.2 to 2.8.1, via [PR #37132](https://github.com/gatsbyjs/gatsby/pull/37132) and [PR #37217](https://github.com/gatsbyjs/gatsby/pull/37217)
  - Update `lmdb` from 2.5.3 to 2.7.1, via [PR #37160](https://github.com/gatsbyjs/gatsby/pull/37160)

## Contributors

A big **Thank You** to [our community who contributed][full-changelog] to this release 💜

- [mudge](https://github.com/mudge): fix(gatsby): Use path prefix when loading slice data [PR #37202](https://github.com/gatsbyjs/gatsby/pull/37202)
- [heimoshuiyu](https://github.com/heimoshuiyu): feat(gatsby-transformer-sharp): Add `avif` to supportedExtensions [PR #37112](https://github.com/gatsbyjs/gatsby/pull/37112)
- [openscript](https://github.com/openscript): feat(gatsby): Add `documentSearchPaths` option to `graphqlTypegen` [PR #37120](https://github.com/gatsbyjs/gatsby/pull/37120)

[full-changelog]: https://github.com/gatsbyjs/gatsby/compare/gatsby@5.3.0-next.0...gatsby@5.3.0
