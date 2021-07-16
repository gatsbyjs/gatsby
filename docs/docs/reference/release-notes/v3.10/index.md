---
date: "2021-07-20"
version: "3.10.0"
title: "v3.10 Release Notes"
---

Welcome to `gatsby@3.10.0` release (July 2021 #2)

Key highlights of this release:

- [Experimental: Parallel Query Running](#experimental-parallel-query-running) - Improves time it takes to run queries during gatsby build
- [Experimental: webpack persistent caching for `gatsby develop`](#experimental-webpack-persistent-caching-for-gatsby-develop) - significantly speed up start of webpack server

Also check out [notable bugfixes](#notable-bugfixes--improvements).

**Bleeding Edge:** Want to try new features as soon as possible? Install `gatsby@next` and let us know
if you have any [issues](https://github.com/gatsbyjs/gatsby/issues).

[Previous release notes](/docs/reference/release-notes/v3.9)

[Full changelog](https://github.com/gatsbyjs/gatsby/compare/gatsby@3.10.0-next.0...gatsby@3.10.0)

---

## Experimental: Parallel Query Running

TODO: Explanation of what it does, LMDB?, Benchmark comparison, clarification what type of sites this helps with, screenshot?

To use it and try it out, please make sure that you're using Node v14.10 or later. Install `lmdb-store` as a dependency:

```shell
npm install lmdb-store
```

Then enable the config flag in your `gatsby-config.js`:

```js:title=gatsby-config.js
module.exports = {
  flags: {
    PARALLEL_QUERY_RUNNING: true,
  },
}
```

Please share your results, findings, and feedback in the [PQR GitHub Discussion](https://gatsby.dev/pqr-feedback). You'll also be able to read about known/common pitfalls there and possible solutions.

## Experimental: webpack persistent caching for `gatsby develop`

After rolling out webpack 5 persistent caching for production builds in [Gatsby v3.8](/docs/reference/release-notes/v3.8/#webpack-caching) we're now beginning the gradual rollout of it for `gatsby develop`. It greatly improves the startup time of the development server.

To use it, add a flag to your `gatsby-config.js`:

```js:title=gatsby-config.js
module.exports = {
  flags: {
    DEV_WEBPACK_CACHE: true,
  },
}
```

If you're already using the `FAST_DEV` flag you'll be using it automatically once you update to Gatsby v3.10. Please share your feedback in the [GitHub Discussion](https://gatsby.dev/cache-clearing-feedback).

## Notable bugfixes & improvements

- `gatsby`: Update `postcss` to 8.3.5 to remove deprecation warning on Node v16.
- `gatsby`: Switched `createRoot` to `hydrateRoot`. Please note, this only applies if you use [React 18 in Gatsby](https://github.com/gatsbyjs/gatsby/discussions/31943).
- `gatsby-source-wordpress`: Check preview URL earlier and give better feedback, via [PR #32251](https://github.com/gatsbyjs/gatsby/pull/32251).
- `gatsby`: Pass `search` and `hash` to `window.location` to final URL of redirect and after the service worker updated, via [PR #32334](https://github.com/gatsbyjs/gatsby/pull/32334) and [PR #32323](https://github.com/gatsbyjs/gatsby/pull/32323).
- `gatsby`: Avoid the `UNHANDLED REJECTION write EPIPE` error when using `Ctrl + C`, via [PR #32311](https://github.com/gatsbyjs/gatsby/pull/32311) and [PR #32356](https://github.com/gatsbyjs/gatsby/pull/32356).
- `gatsby`: When a `gatsby build` fails on e.g. missing data it now prints the `page-data.json` file for this page to give more context on what's missing, via [PR #32301](https://github.com/gatsbyjs/gatsby/pull/32301).
- `gatsby-source-contentful`: Support image corner radius from Image API, via [PR #32333](https://github.com/gatsbyjs/gatsby/pull/32333).
- `gatsby-source-contentful`: Support `metadata.tags` property, via [PR #31746](https://github.com/gatsbyjs/gatsby/pull/31746).

## Contributors

A big **Thank You** to [our community who contributed](https://github.com/gatsbyjs/gatsby/compare/gatsby@3.10.0-next.0...gatsby@3.10.0) to this release 💜

TODO
