---
date: "2022-03-29"
version: "4.11.0"
title: "v4.11 Release Notes"
---

Welcome to `gatsby@4.11.0` release (March 2022 #3)

Key highlights of this release:

- [`gatsby-source-shopify` v7](#gatsby-source-shopify-v7)

Also check out [notable bugfixes](#notable-bugfixes--improvements).

**Bleeding Edge:** Want to try new features as soon as possible? Install `gatsby@next` and let us know
if you have any [issues](https://github.com/gatsbyjs/gatsby/issues).

[Previous release notes](/docs/reference/release-notes/v4.10)

[Full changelog][full-changelog]

---

## `gatsby-source-shopify` v7

TODO

## Notable bugfixes & improvements

- `gatsby`
  - Fix compatibility issues with `react@18.0.0-rc.2`, via [PR #35108](https://github.com/gatsbyjs/gatsby/pull/35108)
  - Fix eperm issue on windows when clearing cache, via [PR #35154](https://github.com/gatsbyjs/gatsby/pull/35154)
  - Improve functions compilation error, via [PR #35196](https://github.com/gatsbyjs/gatsby/pull/35196)
- `gatsby-plugin-utils`: Support aspect ratio for Image Service, via [PR #35087](https://github.com/gatsbyjs/gatsby/pull/35087)
- `gatsby-source-mogodb`: Add optional `typePrefix` option to override dbName, via [PR #33820](https://github.com/gatsbyjs/gatsby/pull/33820)
- `gatsby-cli`: Resolve babel preset ts explicitly, via [PR #35153](https://github.com/gatsbyjs/gatsby/pull/35153)
- `gatsby-plugin-preact`: Fix preact alias via [PR #35196](https://github.com/gatsbyjs/gatsby/pull/35156)

## Contributors

A big **Thank You** to [our community who contributed][full-changelog] to this release 💜

[full-changelog]: https://github.com/gatsbyjs/gatsby/compare/gatsby@4.11.0-next.0...gatsby@4.11.0
