---
date: "2023-03-21"
version: "5.8.0"
title: "v5.8 Release Notes"
---

Welcome to `gatsby@5.8.0` release (March 2023 #1)

Check out [notable bugfixes](#notable-bugfixes--improvements).

**Bleeding Edge:** Want to try new features as soon as possible? Install `gatsby@next` and let us know if you have any [issues](https://github.com/gatsbyjs/gatsby/issues).

[Previous release notes](/docs/reference/release-notes/v5.7)

[Full changelog][full-changelog]

---

## Notable bugfixes & improvements

- `gatsby`:
  - Regenerate HTML when lazily imported component changes, via [PR #37712](https://github.com/gatsbyjs/gatsby/pull/37712)
  - Invalidate webpack cache when `gatsby-node.mjs` changes, via [PR #37750](https://github.com/gatsbyjs/gatsby/pull/37750)
- `gatsby-plugin-page-creator`: Correctly recreate deleted pages during `gatsby develop`, via [PR #37745](https://github.com/gatsbyjs/gatsby/pull/37745)
- `gatsby-plugin-mdx`: Account for links and inline code in table of contents, via [PR #37789](https://github.com/gatsbyjs/gatsby/pull/37739)
- `gatsby-source-wordpress`: Add compatibility with `WPGraphQL` version `1.14.0`, via [PR #37749](https://github.com/gatsbyjs/gatsby/pull/37749)

## Contributors

A big **Thank You** to [our community who contributed][full-changelog] to this release 💜

- [MarcusCole518](https://github.com/MarcusCole518): chore(docs): fix dead link on gatsby-cli doc [PR #37675](https://github.com/gatsbyjs/gatsby/pull/37675)
- [Saideepak01](https://github.com/Saideepak01): feat(gatsby-source-shopify): Add `apiVersion` option [PR #37605](https://github.com/gatsbyjs/gatsby/pull/37605)
- [cadamini](https://github.com/cadamini): chore(docs): Improve "Choosing a CMS" article structure [PR #37741](https://github.com/gatsbyjs/gatsby/pull/37741)
- [ch264](https://github.com/ch264): chore(docs): Update "Adding search" [PR #37703](https://github.com/gatsbyjs/gatsby/pull/37703)
- [chadwcarlson](https://github.com/chadwcarlson): chore(docs): Update "Building a theme" tutorial [PR #37728](https://github.com/gatsbyjs/gatsby/pull/37728)
- [grgcnnr](https://github.com/grgcnnr): chore(docs): Update `path.resolve` example to include leading `./` [PR #37685](https://github.com/gatsbyjs/gatsby/pull/37685)
- [jancama2](https://github.com/jancama2): fix(gatsby): Use optional chaining in `onHeadRendered` [PR #37669](https://github.com/gatsbyjs/gatsby/pull/37669)
- [oskari](https://github.com/oskari): chore(gatsby): Remove obsolete `st` package [PR #37726](https://github.com/gatsbyjs/gatsby/pull/37726)
- [rogermparent](https://github.com/rogermparent): fix(gatsby-plugin-page-creator): Track correct `knownPagePaths` [PR #37745](https://github.com/gatsbyjs/gatsby/pull/37745)
- [xSyki](https://github.com/xSyki): fix(gatsby): Change backdrop position to `fixed` [PR #37698](https://github.com/gatsbyjs/gatsby/pull/37698)
- [yunsuklee](https://github.com/yunsuklee): fix(gatsby-plugin-mdx): Account for links/inline code in ToC [PR #37739](https://github.com/gatsbyjs/gatsby/pull/37739)

[full-changelog]: https://github.com/gatsbyjs/gatsby/compare/gatsby@5.8.0-next.0...gatsby@5.8.0
