---
date: "2021-02-02"
version: "2.32.0"
---

# [v2.31](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.32.0-next.0...gatsby@2.32.0) (February 2021 #1)

Welcome to `gatsby@2.32.0` release (February 2021 #1)

Key highlights of this release:

## Performance improvements for larger sites (10000+ pages)

We landed two PRs that improve build performance for larger sites.

- https://github.com/gatsbyjs/gatsby/pull/29240
- https://github.com/gatsbyjs/gatsby/pull/29219

On our [minimal benchmark site](https://github.com/gatsbyjs/gatsby/tree/master/benchmarks/create-pages), these improved build times by ~15% for a 10,000 page site and 30% for a 100,000 page site!

---

## Contributors

A big **Thank You** to [our community who contributed](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.32.0-next.0...gatsby@2.32.0) to this release 💜

- [nathanchu](https://github.com/nathanchu)

  - chore(docs): Fix grammar in add-404-page [PR #29079](https://github.com/gatsbyjs/gatsby/pull/29079)
  - fix(gatsby-plugin-styled-components): add `namespace` option [PR #29095](https://github.com/gatsbyjs/gatsby/pull/29095)

- [Grsmto](https://github.com/Grsmto): fix(gatsby-plugin-image): pass down missing sizes attribute to <sources> [PR #29092](https://github.com/gatsbyjs/gatsby/pull/29092)

- [StefanSelfTaught](https://github.com/StefanSelfTaught): Update creating-a-local-plugin.md [PR #28072](https://github.com/gatsbyjs/gatsby/pull/28072)

- [Simply007](https://github.com/Simply007): Update plugin option schema validation code sample [PR #28904](https://github.com/gatsbyjs/gatsby/pull/28904)
- [ediblecode](https://github.com/ediblecode): fix(gatsby): Add missing prev location TS property for RouteUpdateArgs [PR #29125](https://github.com/gatsbyjs/gatsby/pull/29125)
- [k4y4k](https://github.com/k4y4k): docs: fix a small typo [PR #29117](https://github.com/gatsbyjs/gatsby/pull/29117)
- [Himanshu-27](https://github.com/Himanshu-27): chore(docs): Netlify CMS added branch to backend settings [PR #29162](https://github.com/gatsbyjs/gatsby/pull/29162)
- [mottox2](https://github.com/mottox2): docs: fix broken link [PR #29163](https://github.com/gatsbyjs/gatsby/pull/29163)
- [yonatanLehman](https://github.com/yonatanLehman): chore(docs): Update debugging-the-build-process [PR #29067](https://github.com/gatsbyjs/gatsby/pull/29067)
- [alexleventer](https://github.com/alexleventer): chore(docs): Add cassandra to list of database sources [PR #29137](https://github.com/gatsbyjs/gatsby/pull/29137)
- [johanneswuerbach](https://github.com/johanneswuerbach): fix: sync crash with error response [PR #29212](https://github.com/gatsbyjs/gatsby/pull/29212)
- [jevenson](https://github.com/jevenson): chore(docs): Update TypeScript Unit Testing Docs [PR #29227](https://github.com/gatsbyjs/gatsby/pull/29227)
