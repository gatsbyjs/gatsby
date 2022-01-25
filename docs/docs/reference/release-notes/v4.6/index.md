---
date: "2022-01-25"
version: "4.6.0"
title: "v4.6 Release Notes"
---

Welcome to `gatsby@4.6.0` release (January 2022 #2)

Key highlights of this release:

- [Speeding Up Subsequent Queries](#speeding-up-subsequent-queries)
- [Tracking Image Changes in Markdown Files](#tracking-image-changes-in-markdown-files)
- [Fix Plugin Schema Validation](#fix-plugin-schema-validation)

Also check out [notable bugfixes](#notable-bugfixes--improvements).

**Bleeding Edge:** Want to try new features as soon as possible? Install `gatsby@next` and let us know
if you have any [issues](https://github.com/gatsbyjs/gatsby/issues).

[Previous release notes](/docs/reference/release-notes/v4.5)

[Full changelog][full-changelog]

---

## Speeding Up Subsequent Queries

Walking nodes to track inline objects is very expensive. Caching this across instances of the graphql query sped up subsequent queries by ~10-15% (depending on complexity of nodes).

## Tracking Image Changes in Markdown Files

Images seen in markdown are not actually registered as node dependencies for the given page, this means that images won't get updated on the fly if the image content changes and the image name doesn't change.

## Fix Plugin Schema Validation

For plugin authors, we fixed an issue that prevented default values from `pluginOptionsSchema` to be passed when consuming plugin options. This [issue](https://github.com/gatsbyjs/gatsby/issues/33033) is now fixed via [#34182](https://github.com/gatsbyjs/gatsby/pull/34182) This introduces some breaking changes:

- `pluginOptionsSchema` will give warnings instead of throw errors when a plugin receives an uknown configuration key
- `pluginOptionsSchema` will respect default configuration keys set with Joi
- `testPluginOptionsSchema` function will also return `hasWarnings` and `warnings` properties for use in test suites

## Notable Bugfixes & Improvements

`gatsby-plugin-manifest` generate icons sequentially via [PR #34331](https://github.com/gatsbyjs/gatsby/pull/34331)

- `create-gatsby`: Fixed issue where user-provided `GATSBY_TELEMETRY_DISABLED` environment variable did not disable telemetry, via [PR #34495](https://github.com/gatsbyjs/gatsby/pull/34495)
- `gatsby-sharp` - create more resilient wrapper around sharp via [PR #34339](https://github.com/gatsbyjs/gatsby/pull/34339)
- `gatsby-source-contentful` : enable tag support for assets via [PR #34480](https://github.com/gatsbyjs/gatsby/pull/34480)
- `gatsby` - move id.eq fast path handling to node-model so it's shared between query running strategies via [PR #34520](https://github.com/gatsbyjs/gatsby/pull/34520)

## Contributors

A big **Thank You** to [our community who contributed][full-changelog] to this release 💜

TODO

[full-changelog]: https://github.com/gatsbyjs/gatsby/compare/gatsby@4.6.0-next.0...gatsby@4.6.0
