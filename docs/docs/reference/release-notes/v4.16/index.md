---
date: "2022-06-06"
version: "4.16.0"
title: "v4.16 Release Notes"
---

Welcome to `gatsby@4.16.0` release (June 2022 #1)

Key highlights of this release:

- [Speed Improvements for Image Processing](#speed-improvements-for-image-processing)
- [`useContentfulImage` hook](#usecontentfulimage-hook)
- [Node 18 Compability](#node-18-compability)

Also check out [notable bugfixes](#notable-bugfixes--improvements).

**Bleeding Edge:** Want to try new features as soon as possible? Install `gatsby@next` and let us know if you have any [issues](https://github.com/gatsbyjs/gatsby/issues).

[Previous release notes](/docs/reference/release-notes/v4.15)

[Full changelog][full-changelog]

---

## Speed Improvements for Image Processing

When updating `gatsby-plugin-image` and `gatsby-plugin-sharp` you should see a considerate amount of time saved during image processing as two improvements were shipped. In [PR #35791](https://github.com/gatsbyjs/gatsby/pull/35791) the image metadata to calculcate things like dominant color was moved to a cache that persists between builds leading to increased speed on subsequent builds. In [PR #35814](https://github.com/gatsbyjs/gatsby/pull/35814) the image is getting resized before calculating the dominant color as this can get slow for really large images. This may be a lass accurate representation, but for a placeholder it is good enough. Thanks to [ascorbic](https://github.com/ascorbic) for contributing both PRs.

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

## Node 18 Compability

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

## Contributors

A big **Thank You** to [our community who contributed][full-changelog] to this release 💜
