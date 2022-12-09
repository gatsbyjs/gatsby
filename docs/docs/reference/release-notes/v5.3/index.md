---
date: "2022-12-13"
version: "5.3.0"
title: "v5.3 Release Notes"
---

Welcome to `gatsby@5.3.0` release (December 2022 #1)

Key highlights of this release:

- [ES Modules (ESM) in Gatsby files](#es-modules-esm-in-gatsby-files)
- [Improved error messages](#improved-error-messages)

Also check out [notable bugfixes](#notable-bugfixes--improvements).

**Bleeding Edge:** Want to try new features as soon as possible? Install `gatsby@next` and let us know if you have any [issues](https://github.com/gatsbyjs/gatsby/issues).

[Previous release notes](/docs/reference/release-notes/v5.2)

[Full changelog][full-changelog]

---

## ES Modules (ESM) in Gatsby files

TODO

## Improved error messages

TODO

- Improve the error overlay shown during Gatsby Preview when an HTML error happens, via [PR #37195](https://github.com/gatsbyjs/gatsby/pull/37195)
- https://github.com/gatsbyjs/gatsby/pull/37206
- https://github.com/gatsbyjs/gatsby/pull/37220

## Notable bugfixes & improvements

- `gatsby-plugin-image`: Ensure cache hash is unique, via [PR #37087](https://github.com/gatsbyjs/gatsby/pull/37087)
- `gatsby`:
  - Add `documentSearchPaths` option to `graphqlTypegen`, via [PR #37120](https://github.com/gatsbyjs/gatsby/pull/37120)
  - Materialize nodes in `gatsbyPath`, via [PR #37111](https://github.com/gatsbyjs/gatsby/pull/37111)
- `gatsby-plugin-utils`: Add `pathPrefix` to Image CDN URLs, via [PR #36772](https://github.com/gatsbyjs/gatsby/pull/36772)
- Miscellaneous dependency updates:
  - Update `sharp` from 0.30.7 to 0.31.2, via [PR #37131](https://github.com/gatsbyjs/gatsby/pull/37131)
  - Update `parcel` from 2.6.2 to 2.8.1, via [PR #37132](https://github.com/gatsbyjs/gatsby/pull/37132) and [PR #37217](https://github.com/gatsbyjs/gatsby/pull/37217)
  - Update `lmdb` from 2.5.3 to 2.7.1, via [PR #37160](https://github.com/gatsbyjs/gatsby/pull/37160)

## Contributors

A big **Thank You** to [our community who contributed][full-changelog] to this release 💜

TODO

[full-changelog]: https://github.com/gatsbyjs/gatsby/compare/gatsby@5.3.0-next.0...gatsby@5.3.0
