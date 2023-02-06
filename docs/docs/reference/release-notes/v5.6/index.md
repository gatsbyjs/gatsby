---
date: "2023-02-07"
version: "5.6.0"
title: "v5.6 Release Notes"
---

Welcome to `gatsby@5.6.0` release (February 2023 #1)

Key highlights of this release:

- [Gatsby is joining Netlify](#gatsby-is-joining-netlify)
- [Head API supports providers from `wrapRootElement`](#head-api-supports-providers-from-wraprootelement)

Also check out [notable bugfixes](#notable-bugfixes--improvements).

**Bleeding Edge:** Want to try new features as soon as possible? Install `gatsby@next` and let us know if you have any [issues](https://github.com/gatsbyjs/gatsby/issues).

[Previous release notes](/docs/reference/release-notes/v5.5)

[Full changelog][full-changelog]

---

## Gatsby is joining Netlify

In case you have missed the news, [Gatsby is joining Netlify](https://www.gatsbyjs.com/blog/gatsby-is-joining-netlify/) 🎉

**Gatsby as a framework will continue to evolve and grow.** We’ve always shared with Netlify a mutual commitment to open-source and have never been more excited about Gatsby’s future. Many of Gatsby’s core contributors will join Netlify and continue to maintain the Gatsby framework.

Be sure to join [our Discord](https://gatsby.dev/discord), follow [Gatsby](https://twitter.com/gatsbyjs) and [Netlify](https://twitter.com/Netlify) on Twitter or continue to read these release notes to know when we share our plans for the future.

## Head API supports providers from `wrapRootElement`

TODO

## Notable bugfixes & improvements

- `gatsby`:
  - Fix static query mapping when contentFilePath contains a space, via [PR #37544](https://github.com/gatsbyjs/gatsby/pull/37544)
  - Bump `@gatsbyjs/reach-router` to fix `husky` install issue, via [PR #37547](https://github.com/gatsbyjs/gatsby/pull/37547)
  - Support Slices in `DEV_SSR`, via [PR #37542](https://github.com/gatsbyjs/gatsby/pull/37542)
  - Move `react-dom-server` out of `framework` chunks, via [PR #37508](https://github.com/gatsbyjs/gatsby/pull/37508)
- `gatsby-plugin-utils`: Export two `IRemoteFile` utility types, via [PR #37532](https://github.com/gatsbyjs/gatsby/pull/37532)

## Contributors

A big **Thank You** to [our community who contributed][full-changelog] to this release 💜

TODO

[full-changelog]: https://github.com/gatsbyjs/gatsby/compare/gatsby@5.6.0-next.0...gatsby@5.6.0
