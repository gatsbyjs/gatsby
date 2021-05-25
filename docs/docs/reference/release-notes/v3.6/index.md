---
date: "2021-05-25"
version: "3.6.0"
---

# [v3.6](https://github.com/gatsbyjs/gatsby/compare/gatsby@3.6.0-next.0...gatsby@3.6.0) (May 2021 #2)

Welcome to `gatsby@3.6.0` release (May 2021 #2)

Key highlights of this release:

- [Functions](#functions) - TODO
- [Preview Status Indicator](#preview-status-indicator) - TODO

Also check out [notable bugfixes](#notable-bugfixes--improvements).

**Bleeding Edge:** Want to try new features as soon as possible? Install `gatsby@next` and let us know
if you have any [issues](https://github.com/gatsbyjs/gatsby/issues).

[Previous release notes](/docs/reference/release-notes/v3.5)

[Full changelog](https://github.com/gatsbyjs/gatsby/compare/gatsby@3.6.0-next.0...gatsby@3.6.0)

---

## Functions

- Functions in plugins: https://github.com/gatsbyjs/gatsby/pull/31466
- Uploading files: https://github.com/gatsbyjs/gatsby/pull/31470
- Disable minifaction: https://github.com/gatsbyjs/gatsby/pull/31473
- FS Caching: https://github.com/gatsbyjs/gatsby/pull/31505
- Lazy Compile Functions in Dev: https://github.com/gatsbyjs/gatsby/pull/31508

## Preview Status Indicator

TODO + Add preview image (via githubusercontent link)
https://github.com/gatsbyjs/gatsby/pull/31347

## Notable bugfixes & improvements

- `gatsby-source-wordpress`: Add `searchAndReplace` feature, via [PR #31091](https://github.com/gatsbyjs/gatsby/pull/31091)
- `gatsby-plugin-sitemap`: Fixes a bug where sitemaps were being written in a sub-directory but the sitemap index didn't contain that sub-directory, via [PR #31184](https://github.com/gatsbyjs/gatsby/pull/31184). Also remove `reporter.verbose` calls that would spam your Gatsby Cloud logs, via [PR #31448](https://github.com/gatsbyjs/gatsby/pull/31448).
- `gatsby-source-drupal`: Add toggleable multilingual support by prefixing nodes with their langcode, via [PR #26720](https://github.com/gatsbyjs/gatsby/pull/26720)
- `gatsby-plugin-image`: Remove extra "margin" on `CONSTRAINED` images, via [PR #31497](https://github.com/gatsbyjs/gatsby/pull/31497)
- `gatsby-source-contentful`: Use correct parameter for "focus" & fix dominant color on cropped images, via [PR #31492](https://github.com/gatsbyjs/gatsby/pull/31492)

## Contributors

A big **Thank You** to [our community who contributed](https://github.com/gatsbyjs/gatsby/compare/gatsby@3.6.0-next.0...gatsby@3.6.0) to this release 💜

TODO
