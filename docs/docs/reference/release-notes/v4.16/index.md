---
date: "2022-06-06"
version: "4.16.0"
title: "v4.16 Release Notes"
---

Welcome to `gatsby@4.16.0` release (June 2022 #1)

Key highlights of this release:

- [Speed Improvements for Image Processing](#speed-improvements-for-image-processing)

Also check out [notable bugfixes](#notable-bugfixes--improvements).

**Bleeding Edge:** Want to try new features as soon as possible? Install `gatsby@next` and let us know if you have any [issues](https://github.com/gatsbyjs/gatsby/issues).

[Previous release notes](/docs/reference/release-notes/v4.15)

[Full changelog][full-changelog]

---

## Speed Improvements for Image Processing

When updating `gatsby-plugin-image` and `gatsby-plugin-sharp` you should see a considerate amount of time saved during image processing as two improvements were shipped. In [PR #35791](https://github.com/gatsbyjs/gatsby/pull/35791) the image metadata to calculcate things like dominant color was moved to a cache that persists between builds leading to increased speed on subsequent builds. In [PR #35814](https://github.com/gatsbyjs/gatsby/pull/35814) the image is getting resized before calculating the dominant color as this can get slow for really large images. This may be a lass accurate representation, but for a placeholder it is good enough. Thanks to [ascorbic](https://github.com/ascorbic) for contributing both PRs.

## Notable bugfixes & improvements

TODO

## Contributors

A big **Thank You** to [our community who contributed][full-changelog] to this release 💜
