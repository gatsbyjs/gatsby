---
date: "2022-01-25"
version: "4.6.0"
title: "v4.6 Release Notes"
---

Welcome to `gatsby@4.6.0` release (November 2021 #1)

Key highlights of this release:

-

Also check out [notable bugfixes](#notable-bugfixes--improvements).

**Bleeding Edge:** Want to try new features as soon as possible? Install `gatsby@next` and let us know
if you have any [issues](https://github.com/gatsbyjs/gatsby/issues).

[Previous release notes](/docs/reference/release-notes/v4.4)

[Full changelog][full-changelog]

---

## Notable Bugfixes & Improvements

- `gatsby-transform-remark` and `gatsby-remark-images`: Fixed caching issue where `gatsby-transformer-remark` would not reload image dependencies from `gatsby-remark-images` while running `gatsby develop`, via [PR #34433](https://github.com/gatsbyjs/gatsby/pull/34433)
- `gatsby-plugin-utils` fixes to plugin schema validation via [PR #34182](https://github.com/gatsbyjs/gatsby/pull/34182):
  - `pluginOptionsSchema` will give warnings instead of throw errors when a plugin receives an uknown configuration key
  - `pluginOptionsSchema` will respect default configuration keys set with Joi
  - `testPluginOptionsSchema` function will also return `hasWarnings` and `warnings` properties for use in test suites
- `create-gatsby`: Fixed issue where user-provided `GATSBY_TELEMETRY_DISABLED` environment variable did not disable telemetry, via [PR #34495](https://github.com/gatsbyjs/gatsby/pull/34495)

## Contributors

A big **Thank You** to [our community who contributed][full-changelog] to this release 💜

TODO

[full-changelog]: https://github.com/gatsbyjs/gatsby/compare/gatsby@4.6.0-next.0...gatsby@4.6.0
