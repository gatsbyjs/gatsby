---
date: "2022-07-19"
version: "4.19.0"
title: "v4.19 Release Notes"
---

Welcome to `gatsby@4.19.0` release (July 2022 #2)

Key highlights of this release:

- [Gatsby Head API](#todo) - TODO
- [Release Candidate for gatsby-plugin-mdx v4](#todo) - Support for MDX v2 and more!

Also check out [notable bugfixes](#notable-bugfixes--improvements).

**Bleeding Edge:** Want to try new features as soon as possible? Install `gatsby@next` and let us know if you have any [issues](https://github.com/gatsbyjs/gatsby/issues).

[Previous release notes](/docs/reference/release-notes/v4.18)

[Full changelog][full-changelog]

---

## Gatsby Head API

TODO

## Release Candidate for gatsby-plugin-mdx v4

TODO

## Notable bugfixes & improvements

- Publish `gatsby-script`, `gatsby-link`, and `gatsby-core-utils` both as CJS & ESM, via [PR #36012](https://github.com/gatsbyjs/gatsby/pull/36012) and [PR #36020](https://github.com/gatsbyjs/gatsby/pull/36020)
- `gatsby`
  - Sanitize page state to remove non-serializable elements, via [PR #36074](https://github.com/gatsbyjs/gatsby/pull/36074)
  - Remove the `/___services` endpoint and remove development proxy. Also remove `proxyPort` (aliased to `port` for now). Via [PR #35675](https://github.com/gatsbyjs/gatsby/pull/35675)

## Contributors

A big **Thank You** to [our community who contributed][full-changelog] to this release 💜

TODO

[full-changelog]: https://github.com/gatsbyjs/gatsby/compare/gatsby@4.19.0-next.0...gatsby@4.19.0
