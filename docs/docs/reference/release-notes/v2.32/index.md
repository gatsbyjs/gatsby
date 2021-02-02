---
date: "2021-02-02"
version: "2.32.0"
---

# [v2.31](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.32.0-next.0...gatsby@2.32.0) (February 2021 #1)

Welcome to `gatsby@2.32.0` release (February 2021 #1)

Key highlights of this release:

- [Stable API in beta image plugin](#stable-api-in-beta-image-plugin)
- [Support for beta image plugin in Contentful](#support-for-beta-image-plugin-in-contentful)
- [Support for art direction in beta image plugin](#support-for-art-direction-in-beta-image-plugin)
- [Performance improvements for larger sites (10000+ pages)](#performance-improvements-for-larger-sites-10000-pages)

## Stable API in beta image plugin

With this release, [the API for gatsby-plugin-image](https://gatsbyjs.com/docs/reference/built-in-components/gatsby-plugin-image) can be considered stable. We do not expect any breaking changes to be made before general release, and now will just be making bugfixes and minor updates. You can start to [migrate your sites to use the new plugin](https://www.gatsbyjs.com/docs/reference/release-notes/image-migration-guide/), and benefit from the improved performance, new components, and cleaner API.

## Support for beta image plugin in Contentful

This release includes initial support for the beta image plugin in gatsby-source-contentful. This adds a new `gatsbyImageData` resolver to ContentfulAsset nodes, allowing you to use the new image components with your Contentful data. This is a first release, and does not yet have proper documentation, but please try it out and report back in [the gatsby-plugin-image RFC](https://github.com/gatsbyjs/gatsby/discussions/27950).

## Support for art direction in beta image plugin

Art direction is a browser feature that allows you to specify different images to be displayed at different screen sizes. This is different from responsive images, which just provides different image resolutions, as it allows you to use completely different images, or different crops of the same image. Until now this feature has been missing in the new image plugin, but this release adds a new `useArtDirection` hook, which allows you to art direct your images. It does not have full docs, but see [the PR](https://github.com/gatsbyjs/gatsby/pull/29231) for more information and a video featuring a pug in a raincoat.

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
- [domvo](https://github.com/domvo) fix(gatsby-plugin-sharp): make sure to pass the failOnError option to base64 generation [PR #29254](https://github.com/gatsbyjs/gatsby/pull/29254)
