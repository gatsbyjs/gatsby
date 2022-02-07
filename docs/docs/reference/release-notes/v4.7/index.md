---
date: "2022-02-08"
version: "4.7.0"
title: "v4.7 Release Notes"
---

Welcome to `gatsby@4.7.0` release (February 2022 #1)

Key highlights of this release:

- `trailingSlash` Config Option

Also check out [notable bugfixes](#notable-bugfixes--improvements).

**Bleeding Edge:** Want to try new features as soon as possible? Install `gatsby@next` and let us know
if you have any [issues](https://github.com/gatsbyjs/gatsby/issues).

[Previous release notes](/docs/reference/release-notes/v4.6)

[Full changelog][full-changelog]

---

## `trailingSlash` Config Option

`gatsby-config.js` now supports a `trailingSlash` configuration with the three main options:

- `always`: Always add trailing slashes to each URL, e.g. `/x` to `/x/`.
- `never`: Remove all trailing slashes on each URL, e.g. `/x/` to `/x`.
- `ignore`: Don't automatically modify the URL

See [the docs page](https://www.gatsbyjs.com/docs/reference/config-files/gatsby-config/#trailingslash) for more information.


## Notable Bugfixes & Improvements
- Module export syntax added for `babel-plugin-remove-api`, via [PR #34581](https://github.com/gatsbyjs/gatsby/pull/34581)
- GraphQL schema generation is sped up by upgrading `graphql-compose` from v7 to v9, via [PR #34504](https://github.com/gatsbyjs/gatsby/pull/34504)
- Remote file downloads are now queued properly for all cases, via [PR #34414](https://github.com/gatsbyjs/gatsby/pull/34414)
- Added a `vanilla-extract` example project, via [PR #34667](https://github.com/gatsbyjs/gatsby/pull/34667)
- Fixed an issue using a `eq: $id` filter on a GatsbyImage in DSG, via [PR #34693](https://github.com/gatsbyjs/gatsby/pull/34693)

## Contributors

A big **Thank You** to [our community who contributed][full-changelog] to this release 💜

TODO

[full-changelog]: https://github.com/gatsbyjs/gatsby/compare/gatsby@4.7.0-next.0...gatsby@4.7.0
