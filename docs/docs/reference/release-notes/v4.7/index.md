---
date: "2022-02-08"
version: "4.7.0"
title: "v4.7 Release Notes"
---

Welcome to `gatsby@4.7.0` release (February 2022 #1)

Key highlights of this release:

- [`trailingSlash` Option](#trailingslash-option) - Now built into the Framework itself
- [Faster Schema Creation & `createPages`](#faster-schema-creation--createpages) - Speed improvements of at least 30%

Also check out [notable bugfixes](#notable-bugfixes--improvements).

**Bleeding Edge:** Want to try new features as soon as possible? Install `gatsby@next` and let us know
if you have any [issues](https://github.com/gatsbyjs/gatsby/issues).

[Previous release notes](/docs/reference/release-notes/v4.6)

[Full changelog][full-changelog]

---

## `trailingSlash` Option

Through the RFC [Integrated handling of trailing slashes in Gatsby](https://github.com/gatsbyjs/gatsby/discussions/34205) we've worked on making the trailing slashes feature a first-class citizen in Gatsby. We're happy to announce that `gatsby-config` now supports a `trailingSlash` configuration with these three main options:

- `always`: Always add trailing slashes to each URL, e.g. `/x` to `/x/`.
- `never`: Remove all trailing slashes on each URL, e.g. `/x/` to `/x`.
- `ignore`: Don't automatically modify the URL

You can set it like this:

```js:title=gatsby-config.js
module.exports = {
  trailingSlash: "always"
}
```

Throughout Gatsby 4 the default setting for `trailingSlash` will be `legacy` (to keep the current behavior) but with Gatsby 5 we'll remove the `legacy` setting and make `always` the default.

Gatsby Cloud supports this new setting out of the box and also uses `301` redirects to bring visitors to the right location. Locally you can use `gatsby serve` to see the behavior. Any other hosting provider (or if you’re managing this on your own) should follow the “Redirects, and expected behavior from the hosting provider” section on the [initial RFC](https://github.com/gatsbyjs/gatsby/discussions/34205).

Please note that these plugins are considered deprecated now: [gatsby-plugin-force-trailing-slashes](/plugins/gatsby-plugin-force-trailing-slashes/) and [gatsby-plugin-remove-trailing-slashes](/plugins/gatsby-plugin-remove-trailing-slashes/).

The information presented here is also available in the [gatsby-config docs page](/docs/reference/config-files/gatsby-config/#trailingslash) and in the [PR #34268](https://github.com/gatsbyjs/gatsby/pull/34268) that implemented this.

## Faster Schema Creation & `createPages`

We've seen a handful of sites struggling with long `schema building` and `createPages` steps. In this release, we've upgraded our external [`graphql-compose`](https://graphql-compose.github.io/) dependency to v9 to improve these steps by at least 30-50% for schemas/queries with many relationships. For example, one of our customers has seen improvements for `createPages` of 786s to 20s. This update is recommended to everyone and doesn't necessitate any changes on your end.

More information can be found in the [PR #34504](https://github.com/gatsbyjs/gatsby/pull/3504).

## Notable Bugfixes & Improvements

- `gatsby`:
  - Handle `export const` syntax in pages and don't remove `config` exports in non-pages, via [PR #34581](https://github.com/gatsbyjs/gatsby/pull/34581) & [PR #34582](https://github.com/gatsbyjs/gatsby/pull/34582)
  - Fix an issue using a `eq: $id` filter with files, via [PR #34693](https://github.com/gatsbyjs/gatsby/pull/34693)
- `gatsby-plugin-fullstory`: Updated snippet, via [PR #34583](https://github.com/gatsbyjs/gatsby/pull/34583)
- `gatsby-core-utils`: Remote file downloads are now queued properly for all cases, via [PR #34414](https://github.com/gatsbyjs/gatsby/pull/34414)
- `gatsby-plugin-preact`: Fix alias for `react-dom/server`, via [PR #34694](https://github.com/gatsbyjs/gatsby/pull/34694)
- Added a `vanilla-extract` example project, via [PR #34667](https://github.com/gatsbyjs/gatsby/pull/34667)

## Contributors

A big **Thank You** to [our community who contributed][full-changelog] to this release 💜

TODO

[full-changelog]: https://github.com/gatsbyjs/gatsby/compare/gatsby@4.7.0-next.0...gatsby@4.7.0
