---
date: "2022-09-27"
version: "4.24.0"
title: "v4.24 Release Notes"
---

Welcome to `gatsby@4.24.0` release (September 2022 #2)

Key highlights of this release:

- [Gatsby 5 Alpha](#gatsby-5-alpha)
- [Hot reload on data changes to File System Routes](#hot-reload-on-data-changes-to-file-system-routes)

Also check out [notable bugfixes](#notable-bugfixes--improvements).

**Bleeding Edge:** Want to try new features as soon as possible? Install `gatsby@next` and let us know if you have any [issues](https://github.com/gatsbyjs/gatsby/issues).

[Previous release notes](/docs/reference/release-notes/v4.23)

[Full changelog][full-changelog]

---

## Gatsby 5 Alpha

TODO

## Hot reload on data changes to File System Routes

TODO

## Notable bugfixes & improvements

- `gatsby-plugin-mdx`: Fix the `React is not defined` error, via [PR #36595](https://github.com/gatsbyjs/gatsby/pull/36595)
- `gatsby-remark-copy-linked-files`: Add `absolutePath` to `dir` function, via [PR #36213](https://github.com/gatsbyjs/gatsby/pull/36213)
- `gatsby` & `gatsby-plugin-mdx`: Fix "Multiple root query" error when using a name for your MDX template, via [PR #36525](https://github.com/gatsbyjs/gatsby/pull/36525)
- `gatsby-parcel-config`: The underlying Parcel config (used for compiling `gatsby-config.ts` and `gatsby-node.ts` files) was changed to only handle JavaScript/TypeScript. This aligns the behavior with current Node.js capabilities of `gatsby-config.js`/`gatsby-node.js` (e.g. you can't just import YAML files), via [PR #36583](https://github.com/gatsbyjs/gatsby/pull/36583)
- `gatsby`: Source maps are available for `gatsby-config.ts`/`gatsby-node.ts` files, via [PR #36450](https://github.com/gatsbyjs/gatsby/pull/36450)

## Contributors

A big **Thank You** to [our community who contributed][full-changelog] to this release 💜

TODO

[full-changelog]: https://github.com/gatsbyjs/gatsby/compare/gatsby@4.24.0-next.0...gatsby@4.24.0
