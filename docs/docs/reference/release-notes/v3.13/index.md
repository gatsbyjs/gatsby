---
date: "2021-08-31"
version: "3.13.0"
title: "v3.13 Release Notes"
---

Welcome to `gatsby@3.13.0` release (August 2021 #3)

Key highlights of this release:

- [Improved Changelogs](#improved-changelogs) - Better structured and easier to read
- [`sharp` v0.29](#sharp-v0.29) - Reduced install size, improved encoding time, and improved AVIF image quality
- [Faster sourcing for `gatsby-source-drupal`](#faster-sourcing-for-gatsby-source-drupal) - Speed up fetching data by around 4x
- [webpack caching in development for everyone](#webpack-caching-in-development-for-everyone) - Activating it for all users

Also check out [notable bugfixes](#notable-bugfixes--improvements).

**Bleeding Edge:** Want to try new features as soon as possible? Install `gatsby@next` and let us know
if you have any [issues](https://github.com/gatsbyjs/gatsby/issues).

[Previous release notes](/docs/reference/release-notes/v3.12)

[Full changelog](https://github.com/gatsbyjs/gatsby/compare/gatsby@3.13.0-next.0...gatsby@3.13.0)

---

## Improved Changelogs

TODO - https://github.com/gatsbyjs/gatsby/pull/32886

## `sharp` v0.29

TODO - https://github.com/gatsbyjs/gatsby/pull/32851

## Faster sourcing for `gatsby-source-drupal`

TODO - https://github.com/gatsbyjs/gatsby/pull/32883

## webpack caching in development for everyone

TODO - https://www.gatsbyjs.com/docs/reference/release-notes/v3.12/#ramping-up-support-for-webpack-caching-in-development

## Notable bugfixes & improvements

- `gatsby-source-drupal`: Provide an additional config option to specify entities that are not translatable to resolve to default language, via [PR #32548](https://github.com/gatsbyjs/gatsby/pull/32548)
- `gatsby`: Remove the `removeDimensions` option from svgo config, via [PR #32834](https://github.com/gatsbyjs/gatsby/pull/32834)
- `gatsby`: Hashes and anchors in redirects also work in production, via [PR #32850](https://github.com/gatsbyjs/gatsby/pull/32850)
- `gatsby-plugin-gatsby-cloud`: Always create the `redirect.json` file even if you remove all redirects, via [PR #32845](https://github.com/gatsbyjs/gatsby/pull/32845)
- `gatsby-remark-images`: Only convert supported image extensions, via [PR #32868](https://github.com/gatsbyjs/gatsby/pull/32868)
- `gatsby-source-wordpress`: Compatibility with Parallel Query Running (PQR), via [PR #32779](https://github.com/gatsbyjs/gatsby/pull/32779)
- `gatsby-core-utils`: Switch from deprecated `auth` option in `got` to `username`/`password`, via [PR #32665](https://github.com/gatsbyjs/gatsby/pull/32665)
- `gatsby`: Don't log `FAST_DEV` messages multiple times, via [PR #32961](https://github.com/gatsbyjs/gatsby/pull/32961)
- `gatsby`: Fix for "Static Query cannot be found" error, via [PR #32949](https://github.com/gatsbyjs/gatsby/pull/32949)

## Contributors

A big **Thank You** to [our community who contributed](https://github.com/gatsbyjs/gatsby/compare/gatsby@3.13.0-next.0...gatsby@3.13.0) to this release 💜

TODO
