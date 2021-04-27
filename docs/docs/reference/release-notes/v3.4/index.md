---
date: "2021-04-27"
version: "3.4.0"
---

# [v3.4](https://github.com/gatsbyjs/gatsby/compare/gatsby@3.4.0-next.0...gatsby@3.4.0) (April 2021 #2)

Welcome to `gatsby@3.4.0` release (April 2021 #2)

Key highlights of this release:

- [Experimental: Enable webpack persistent caching for production builds](#experimental-enable-webpack-persistent-caching-for-production-builds) - significantly speed up webpack compilation on subsequent builds
- [Experimental: Gatsby Functions](#experimental-gatsby-functions) - serverless functions in Gatsby & Gatsby Cloud
- [New Aggregation Resolvers](#new-aggregation-resolvers) - adds `min()`, `max()`, and `sum()` resolvers to `allX` queries
- [Better Fast Refresh handling for styling libraries](#better-fast-refresh-handling-for-styling-libraries) - Theme UI and Chakra UI now work correctly with Fast Refresh

Also check out [notable bugfixes](#notable-bugfixes--improvements).

**Bleeding Edge:** Want to try new features as soon as possible? Install `gatsby@next` and let us know
if you have any [issues](https://github.com/gatsbyjs/gatsby/issues).

[Previous release notes](/docs/reference/release-notes/v3.3)

[Full changelog](https://github.com/gatsbyjs/gatsby/compare/gatsby@3.4.0-next.0...gatsby@3.4.0)

---

## Experimental: Enable webpack persistent caching for production builds

[webpack 5 introduced built in persistent caching](https://webpack.js.org/blog/2020-10-10-webpack-5-release/#persistent-caching). It allows webpack to reuse result of previous compilations and significantly speed up compilation steps.

To use it, add a flag to your `gatsby-config.js`:

```js
// In your gatsby-config.js
module.exports = {
  // your existing config
  flags: {
    PRESERVE_WEBPACK_CACHE: true,
  },
}
```

[Details and discussion](https://github.com/gatsbyjs/gatsby/discussions/28331).

## Experimental: Gatsby Functions

We're making our initial alpha release of serverless functions in Gatsby!

To try it, add a flag to your `gatsby-config.js`:

```js
// In your gatsby-config.js
module.exports = {
  // your existing config
  flags: {
    FUNCTIONS: true,
  },
}
```

[Details and discussion](https://github.com/gatsbyjs/gatsby/discussions/30735). [Original PR](https://github.com/gatsbyjs/gatsby/pull/30192).

[Sign up for early access to Gatsby Functions in Gatsby Cloud](https://www.gatsbyjs.com/functions/).

## New Aggregation Resolvers

The [PR #30789](https://github.com/gatsbyjs/gatsby/pull/30789) added new aggregation resolvers similar to the already existing `group` and `distinct` resolvers. You now can use `min()`, `max()`, and `sum()`. They support numeric fields, but also attempt to cast non-numeric fields and includes them if the value is not `NaN`.

An example query:

```graphql
{
  allShopifyProduct {
    maxPrice: max(field: variants___price)
    minPrice: min(field: variants___price)
    totalPrice: sum(field: variants___price)
  }
}
```

## Better Fast Refresh handling for styling libraries

Since the introduction of Fast Refresh changes to theme files both in [Theme UI](https://theme-ui.com/) and [Chakra UI](https://chakra-ui.com/) didn't result in correct hot-reloading behavior as the user had to manually reload the page to see their changes. The [PR #30901](https://github.com/gatsbyjs/gatsby/pull/30901) added better Fast Refresh handling for components that don't satisfy the constraints set by Fast Refresh but it didn't completely fix the incorrect behavior in both plugins. Upstream PRs from us to [Theme UI](https://github.com/system-ui/theme-ui/pull/1659) and [Chakra UI](https://github.com/chakra-ui/chakra-ui/pull/3841) fixed the behavior! Install `theme-ui@^0.7.1` or `@chakra-ui/gatsby-plugin@^2.0.0` to get the updates.

## Notable bugfixes & improvements

- Fixed page context changes not triggering query rerunning [PR #28590](https://github.com/gatsbyjs/gatsby/pull/28590)
- Fixed not being able to disable `DEV_SSR` flag when `FAST_DEV` is enabled [PR #30992](https://github.com/gatsbyjs/gatsby/pull/30992)
- Speed up `createPages` by ~10% by memoizing `process.env` access [PR #30768](https://github.com/gatsbyjs/gatsby/pull/30768)
- You now can define the `--host` option of `gatsby-cli` with `env.HOST` [PR #26712](https://github.com/gatsbyjs/gatsby/pull/26712)
- Allow CI AWS lamba builds [PR #30653](https://github.com/gatsbyjs/gatsby/pull/30653)
- File System Route API: De-dupe collection pages [PR #31016](https://github.com/gatsbyjs/gatsby/pull/31016)

## Contributors

A big **Thank You** to [our community who contributed](https://github.com/gatsbyjs/gatsby/compare/gatsby@3.4.0-next.0...gatsby@3.4.0) to this release 💜

TODO
