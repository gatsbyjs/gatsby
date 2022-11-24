---
date: "2022-06-06"
version: "4.16.0"
title: "v4.16 Release Notes"
---

Welcome to `gatsby@4.16.0` release (June 2022 #1)

Key highlights of this release:

- [Speed Improvements for Image Processing](#speed-improvements-for-image-processing)
- [`useContentfulImage` hook](#usecontentfulimage-hook)
- [Node 18 Compatibility](#node-18-compatibility)

Also check out [notable bugfixes](#notable-bugfixes--improvements).

**Bleeding Edge:** Want to try new features as soon as possible? Install `gatsby@next` and let us know if you have any [issues](https://github.com/gatsbyjs/gatsby/issues).

[Previous release notes](/docs/reference/release-notes/v4.15)

[Full changelog][full-changelog]

---

## Speed Improvements for Image Processing

After updating `gatsby-plugin-image` and `gatsby-plugin-sharp`, you should see a considerate amount of time saved during image processing as two improvements were shipped. In [PR #35791](https://github.com/gatsbyjs/gatsby/pull/35791) the image metadata to calculcate things like dominant color was moved to a cache that persists between builds leading to increased speed on subsequent builds. In [PR #35814](https://github.com/gatsbyjs/gatsby/pull/35814) the image is getting resized before calculating the dominant color as this can get slow for really large images. This may be a less accurate representation, but for a placeholder it is good enough. Thanks to [ascorbic](https://github.com/ascorbic) for contributing both PRs.

## `useContentfulImage` hook

With `useContentfulImage` and the URL to the image on the Contentful Image API you can create dynamic images on the fly:

```js
import { GatsbyImage } from "gatsby-plugin-image"
import * as React from "react"
import { useContentfulImage } from "gatsby-source-contentful/hooks"

const MyComponent = () => {
  const dynamicImage = useContentfulImage({
    image: {
      url: "//images.ctfassets.net/k8iqpp6u0ior/3BSI9CgDdAn1JchXmY5IJi/f97a2185b3395591b98008647ad6fd3c/camylla-battani-AoqgGAqrLpU-unsplash.jpg",
      width: 2000,
      height: 1000,
    },
  })
  return <GatsbyImage image={dynamicImage} />
}

export default MyComponent
```

Learn more in the [`useContentfulImage` documentation](https://github.com/gatsbyjs/gatsby/blob/master/packages/gatsby-source-contentful/README.md#building-images-on-the-fly-via-usecontentfulimage).

## Node 18 Compatibility

In a series of PRs we've ensured that Gatsby and its dependencies are compatible with Node 18:

- In [PR #35585](https://github.com/gatsbyjs/gatsby/pull/35585) `lmdb` was updated as in never versions it ships with prebuilt binaries for Node 18.
- In [PR #35621](https://github.com/gatsbyjs/gatsby/pull/35621) we migrated from `source-map` to `@jridgewell/trace-mapping` as `source-map` in incompatible with Node 18.
- In [PR #35782](https://github.com/gatsbyjs/gatsby/pull/35782) we updated Parcel to 2.6.0 to update its internal `lmdb` dependency.

## Notable bugfixes & improvements

- `gatsby`:
  - Remove exports in Gatsby files before compiling SSR/DSG engines, via [PR #35749](https://github.com/gatsbyjs/gatsby/pull/35749)
  - Prioritize `raw` body parser, via [PR #35780](https://github.com/gatsbyjs/gatsby/pull/35780)
- `gatsby-plugin-preload-fonts`: Disable Puppeteer cache, via [PR #34633](https://github.com/gatsbyjs/gatsby/pull/34633)
- `gatsby-source-drupal`: Allow sites to configure the request timeout, via [PR #35794](https://github.com/gatsbyjs/gatsby/pull/35794)
- `gatsby-plugin-utils`: Add new `setRequestHeaders` API, via [PR #35655](https://github.com/gatsbyjs/gatsby/pull/35655)
- `gatsby-plugin-utils`: Add `contentDigest` to image cdn args, via [PR #35816](https://github.com/gatsbyjs/gatsby/pull/35816)
- `gatsby-plugin-mdx`: Don't allow JS frontmatter by default, via [PR #35830](https://github.com/gatsbyjs/gatsby/pull/35830)

## Contributors

A big **Thank You** to [our community who contributed][full-changelog] to this release 💜

- [trevorblades](https://github.com/trevorblades): fix(docs): Lowercase typename [PR #35821](https://github.com/gatsbyjs/gatsby/pull/35821)
- [Danishkhurshid](https://github.com/Danishkhurshid): fix(gatsby-source-drupal): Add a check for data prop [PR #35719](https://github.com/gatsbyjs/gatsby/pull/35719)
- [rutterjt](https://github.com/rutterjt): chore(docs): Fix `videoSourceURL` markdown key mismatch [PR #35755](https://github.com/gatsbyjs/gatsby/pull/35755)
- [benogle](https://github.com/benogle): chore(docs): Add articles to awesome gatsby resources [PR #35738](https://github.com/gatsbyjs/gatsby/pull/35738)
- [Apprentice76](https://github.com/Apprentice76): fix(gatsby-source-filesystem): Update `createRemoteFileNode` args [PR #35422](https://github.com/gatsbyjs/gatsby/pull/35422)
- [tsdexter](https://github.com/tsdexter): fix(gatsby-source-wordpress): bug patch for issue 35460 [PR #35817](https://github.com/gatsbyjs/gatsby/pull/35817)
- [AbdallahAbis](https://github.com/AbdallahAbis): chore(docs): Remove typo in Script guide [PR #35826](https://github.com/gatsbyjs/gatsby/pull/35826)
- [axe312ger](https://github.com/axe312ger)
  - Contentful: respect gatsby-plugin-image defaults and extend tests [PR #33536](https://github.com/gatsbyjs/gatsby/pull/33536)
  - chore: clean up yarn.lock [PR #35502](https://github.com/gatsbyjs/gatsby/pull/35502)
  - feat(contentful): new useContentfulHook to create images on client side [PR #29263](https://github.com/gatsbyjs/gatsby/pull/29263)
- [tordans](https://github.com/tordans): chore(docs): Update using-web-fonts for fontsource [PR #35579](https://github.com/gatsbyjs/gatsby/pull/35579)
- [ascorbic](https://github.com/ascorbic)
  - feat(gatsby-plugin-sharp): cache image metadata [PR #35791](https://github.com/gatsbyjs/gatsby/pull/35791)
  - perf(gatsby-plugin-image): downsize image before extracting dominant color [PR #35814](https://github.com/gatsbyjs/gatsby/pull/35814)
- [just-boris](https://github.com/just-boris): fix(gatsby): Remove `removeOffCanvasPaths` svgo option [PR #35788](https://github.com/gatsbyjs/gatsby/pull/35788)
- [varunsh-coder](https://github.com/varunsh-coder): chore(stale-action): Add GitHub token permissions [PR #35713](https://github.com/gatsbyjs/gatsby/pull/35713)
- [Foo-x](https://github.com/Foo-x): fix(gatsby-plugin-preload-fonts): disable cache [PR #34633](https://github.com/gatsbyjs/gatsby/pull/34633)
- [joshuacox](https://github.com/joshuacox): chore(docs): Update outdated building a theme tutorial snippets [PR #35792](https://github.com/gatsbyjs/gatsby/pull/35792)

[full-changelog]: https://github.com/gatsbyjs/gatsby/compare/gatsby@4.16.0-next.0...gatsby@4.16.0
