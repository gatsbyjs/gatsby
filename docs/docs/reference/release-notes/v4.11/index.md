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

We released a new major version of `gatsby-source-shopify` 🎉 Thanks to the work of our community member [Byron Hill](https://github.com/byronlanehill) the new version features a bunch of improvements:

- You can now query product videos or 3D models, in addition to product images.
- Variants, Images, etc. now keep the order in which you define them in the Shopify backend.
- Multiple metafield types were merged to one single metafield type (more alignment with Shopify's admin API schema).
- You can now query presentment prices.
- Explicit type definitions with disabled type inference. Or in other words: You can have no products in your store or a bunch of fields that are `null` without breaking your schema or builds.
- The API schema nearly matches the Shopify admin API schema which means that for the most part you can refer to Shopify's documentation.

Check out the [V6 to V7 Migration Guide](/plugins/gatsby-source-shopify/#v6-to-V7-migration-guide) to learn more. Interested in contributing to Gatsby? Our [contributing section](/contributing/#how-to-contribute) has all the information you need.

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
