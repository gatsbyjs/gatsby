---
date: "2022-11-25"
version: "5.2.0"
title: "v5.2 Release Notes"
---

Welcome to `gatsby@5.2.0` release (November 2022 #3)

Key highlights of this release:

- [`TRACED_SVG` support is removed](#traced_svg-support-is-removed)

Also check out [notable bugfixes](#notable-bugfixes--improvements).

**Bleeding Edge:** Want to try new features as soon as possible? Install `gatsby@next` and let us know if you have any [issues](https://github.com/gatsbyjs/gatsby/issues).

[Previous release notes](/docs/reference/release-notes/v5.1)

[Full changelog][full-changelog]

---

## `TRACED_SVG` support is removed

Due to licensing requirements, we are removing the `Potrace` library usage from Gatsby. `Potrace` was powering `TRACED_SVG` image placeholders generation.

As this removal might have implications, there will be no API-breaking changes. All of the image transformations will continue to work, however using tracedSVG features will now fall back to whatever the default method is - this is generally `DOMINANT_COLOR` for `gatsby-plugin-image` (`gatsbyImageData` and `gatsbyImage`).

Check https://gatsby.dev/tracesvg-removal/ for more information.

## Notable bugfixes & improvements

- TODO

## Contributors

A big **Thank You** to [our community who contributed][full-changelog] to this release 💜

- TODO

[full-changelog]: https://github.com/gatsbyjs/gatsby/compare/gatsby@5.2.0-next.0...gatsby@5.2.0
