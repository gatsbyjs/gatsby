---
date: "2021-08-17"
version: "3.12.0"
title: "v3.12 Release Notes"
---

Welcome to `gatsby@3.12.0` release (August 2021 #2)

Key highlights of this release:

- [Ramping up support for webpack caching in development](#ramping-up-support-for-webpack-caching-in-development) - opt-in 20% of users
- [Improvements to `gatsby-source-shopify`](#improvements-to-gatsby-source-shopify) - Add compat for breaking change in Shopify's API
- [Improvements to `gatsby-source-wordpress`](#improvements-to-gatsby-source-wordpress) - Support for generating WebP images in HTML fields

Also check out [notable bugfixes](#notable-bugfixes--improvements).

**Bleeding Edge:** Want to try new features as soon as possible? Install `gatsby@next` and let us know
if you have any [issues](https://github.com/gatsbyjs/gatsby/issues).

[Previous release notes](/docs/reference/release-notes/v3.11)

[Full changelog](https://github.com/gatsbyjs/gatsby/compare/gatsby@3.12.0-next.0...gatsby@3.12.0)

---

## Ramping up support for webpack caching in development

We [added caching support for webpack in development in 3.10](/docs/reference/release-notes/v3.10#experimental-webpack-persistent-caching-for-gatsby-develop) and it's gotten a fair bit of usage since then.

With this release we opt-in 20% of users for a final test before the full release.

## Improvements to `gatsby-source-shopify`

Our `gatsby-source-shopify` plugin received multiple bug fixes and improvements in this release. If you use Sales Channels you might have gotten wrong results in the past. The filter for it was fixed in [PR #32674](https://github.com/gatsbyjs/gatsby/pull/32674). With [PR #32710](https://github.com/gatsbyjs/gatsby/pull/32710) the plugin will also only query location fields when you activate locations since it requires additional permissions. If you're using [Gatsby Cloud](https://www.gatsbyjs.com/products/cloud/) production builds will now be prioritized over content previews and branch previews (via [PR #32144](https://github.com/gatsbyjs/gatsby/pull/32144)).

Shopify recently deprecated the `valueType` field on metafields. We've updated the API version to `2021-07`, added the new `type` field and aliased the old `valueType` to this new field. So the breaking change is backwards compatible, see [PR #32774](https://github.com/gatsbyjs/gatsby/pull/32774) for all details.

## Improvements to `gatsby-source-wordpress`

Also `gatsby-source-wordpress` received some fixes and foundational work for future improvements. A bug was fixed for Gatsby Preview when e.g. you use the `duplicate-post` plugin in WordPress (via [PR #32488](https://github.com/gatsbyjs/gatsby/pull/32488)). The [PR #32679](https://github.com/gatsbyjs/gatsby/pull/32679) fixed the issue that a low `perPage` option could prevent some `MediaItem` nodes from being fetched.

You can set the [`html.generateWebpImages` option](https://github.com/gatsbyjs/gatsby/blob/master/packages/gatsby-source-wordpress/docs/plugin-options.md#htmlgeneratewebpimages) now to `true` to generate WebP images for images in HTML fields. While this will increase the time it takes to generate images it can improve your performance scores since all major browsers support WebP now.

## Notable bugfixes & improvements

- Dependency Updates: The Renovate bot updated a bunch of dependencies (see [full changelog](https://github.com/gatsbyjs/gatsby/compare/gatsby@3.12.0-next.0...gatsby@3.12.0) for more details), most notably: `eslint` (7.28.0 to 7.32.0), `styletron-react` (5.2.7 to 6.0.1)
- `gatsby-plugin-sitemap`: Add warning that old `exclude` option is obsolete, via [PR #32509](https://github.com/gatsbyjs/gatsby/pull/32509)
- `gatsby`: Worker support for `gatsby develop`, via [PR #32432](https://github.com/gatsbyjs/gatsby/pull/32432)
- `gatsby-source-contentful`: base64 previews now reflect all query options, via [PR #32709](https://github.com/gatsbyjs/gatsby/pull/32709)
- `gatsby-remark-image-contentful`: Show useful error message for files that can not be rendered as image, via [PR #32530](https://github.com/gatsbyjs/gatsby/pull/32530)
- `gatsby`: Speed up "Writing page-data" step by ~10%, via [PR #32763](https://github.com/gatsbyjs/gatsby/pull/32763)

## Contributors

A big **Thank You** to [our community who contributed](https://github.com/gatsbyjs/gatsby/compare/gatsby@3.12.0-next.0...gatsby@3.12.0) to this release 💜

- [teauxfu](https://github.com/teauxfu)

  - chore(docs): Fix typo [PR #32677](https://github.com/gatsbyjs/gatsby/pull/32677)
  - chore(docs): Fix typo [PR #32676](https://github.com/gatsbyjs/gatsby/pull/32676)

- [njbmartin](https://github.com/njbmartin): chore(docs): Fix URL to sharp [PR #32682](https://github.com/gatsbyjs/gatsby/pull/32682)
- [Sayanta66](https://github.com/Sayanta66): chore(starters): Update links in README-template [PR #32549](https://github.com/gatsbyjs/gatsby/pull/32549)
- [orta](https://github.com/orta): fix(gatsby-plugin-sitemap): Add plugin options forbidden for deprecated `exclude` [PR #32509](https://github.com/gatsbyjs/gatsby/pull/32509)
- [mattmortek](https://github.com/mattmortek): fix(gatsby-source-shopify): update method of generating published_status when salesChannel parameter is used [PR #32674](https://github.com/gatsbyjs/gatsby/pull/32674)
- [gabts](https://github.com/gabts): chore(starters): Typo on tsconfig [PR #32700](https://github.com/gatsbyjs/gatsby/pull/32700)
- [nemophrost](https://github.com/nemophrost): fix(gatsby): Worker support in fast-refresh-module [PR #32432](https://github.com/gatsbyjs/gatsby/pull/32432)
- [axe312ger](https://github.com/axe312ger)

  - fix(contentful): base64 previews now reflect all query options [PR #32709](https://github.com/gatsbyjs/gatsby/pull/32709)
  - fix(gatsby-remark-image-contentful): show useful error message for files that can not be rendered as image [PR #32530](https://github.com/gatsbyjs/gatsby/pull/32530)

- [kingkero](https://github.com/kingkero): :construction: Check that node is not falsey [PR #32488](https://github.com/gatsbyjs/gatsby/pull/32488)
- [vi-nastya](https://github.com/vi-nastya): feat(gatsby-source-wordpress): generate webp images [PR #30896](https://github.com/gatsbyjs/gatsby/pull/30896)
- [iAdityaEmpire](https://github.com/iAdityaEmpire)

  - Fixed broken link "Using MDX Plugins" [PR #32726](https://github.com/gatsbyjs/gatsby/pull/32726)
  - Removed another broken link and fixed [PR #32727](https://github.com/gatsbyjs/gatsby/pull/32727)
  - chore(docs): fix typo [PR #32730](https://github.com/gatsbyjs/gatsby/pull/32730)

- [RocketLL](https://github.com/RocketLL): chore(gatsby): fix typo in string enum member [PR #32721](https://github.com/gatsbyjs/gatsby/pull/32721)
- [ascorbic](https://github.com/ascorbic): feat(gatsby): add env flag to disable lazy function compilation in develop [PR #32707](https://github.com/gatsbyjs/gatsby/pull/32707)
- [rburgst](https://github.com/rburgst): fix(wordpress): ensure all file links are rewritten [PR #32679](https://github.com/gatsbyjs/gatsby/pull/32679)
- [SaloniThete](https://github.com/SaloniThete): fix(examples): Correct typo in comment [PR #32762](https://github.com/gatsbyjs/gatsby/pull/32762)
- [redabacha](https://github.com/redabacha): fix(gatsby-plugin-image): only log missing plugin error in development [PR #32335](https://github.com/gatsbyjs/gatsby/pull/32335)
- [nategiraudeau](https://github.com/nategiraudeau): chore(docs): Improved getSavedScrollPosition API desc [PR #32765](https://github.com/gatsbyjs/gatsby/pull/32765)
- [herecydev](https://github.com/herecydev): fix(gatsby): Wrap performance mark in check [PR #32778](https://github.com/gatsbyjs/gatsby/pull/32778)
- [VallyPepyako](https://github.com/VallyPepyako): chore(docs): Fix typo [PR #32784](https://github.com/gatsbyjs/gatsby/pull/32784)
