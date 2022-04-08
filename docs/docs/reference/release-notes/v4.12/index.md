---
date: "2022-04-12"
version: "4.12.0"
title: "v4.12 Release Notes"
---

Welcome to `gatsby@4.12.0` release (April 2022 #1)

Key highlights of this release:

-

Also check out [notable bugfixes](#notable-bugfixes--improvements).

**Bleeding Edge:** Want to try new features as soon as possible? Install `gatsby@next` and let us know
if you have any [issues](https://github.com/gatsbyjs/gatsby/issues).

[Previous release notes](/docs/reference/release-notes/v4.11)

[Full changelog][full-changelog]

---

## Feature

Description

## Notable bugfixes & improvements

- `gatsby`
  - Fix React 18 hydration with offline plugin via [PR #35319](https://github.com/gatsbyjs/gatsby/pull/35319)
  - Use gatsby root instead of `process.cwd()` when initializing cache via [PR #35263](https://github.com/gatsbyjs/gatsby/pull/35263)
  - Fix intermittent wrong sort results when sorting on materialized field via [PR #35271](https://github.com/gatsbyjs/gatsby/pull/35271)
  - Fix URL encoding issue with DSG urls via [PR #35336](https://github.com/gatsbyjs/gatsby/pull/35336)
  - Fix URL encoding issue with SSR urls via [PR #35346](https://github.com/gatsbyjs/gatsby/pull/35346)
- `create-gatsby`: Fix missing site title prompt via [PR #35272](https://github.com/gatsbyjs/gatsby/pull/35272)
- `gatsby-core-utils`: Fix exports map for importing from `dist` via [PR #35274](https://github.com/gatsbyjs/gatsby/pull/35274)
- `gatsby-plugin-sharp`: Handle slashes and `..` within paths for Windows via [PR #35246](https://github.com/gatsbyjs/gatsby/pull/35246)
- `gatsby-plugin-utils`: Fix path pieces being too long in image URLs and make url safely encoded via [PR #35160](https://github.com/gatsbyjs/gatsby/pull/35160)
- `gatsby-source-contentful`: Handle backreferences on data updates properly via [PR #35214](https://github.com/gatsbyjs/gatsby/pull/35214)
- `gatsby-source-wordpress`: Fix logic for matching image nodes via [PR #35324](https://github.com/gatsbyjs/gatsby/pull/35324)

## Contributors

A big **Thank You** to [our community who contributed][full-changelog] to this release 💜

[full-changelog]: https://github.com/gatsbyjs/gatsby/compare/gatsby@4.12.0-next.0...gatsby@4.12.0
