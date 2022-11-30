---
date: "2022-11-25"
version: "5.2.0"
title: "v5.2 Release Notes"
---

Welcome to `gatsby@5.2.0` release (November 2022 #3)

This is an out of band release due to the [removal of the Potrace](#removal-of-potrace) library in Gatsby. We'll continue with our biweekly schedule as normal.

Also check out [notable bugfixes](#notable-bugfixes--improvements).

**Bleeding Edge:** Want to try new features as soon as possible? Install `gatsby@next` and let us know if you have any [issues](https://github.com/gatsbyjs/gatsby/issues).

[Previous release notes](/docs/reference/release-notes/v5.1)

[Full changelog][full-changelog]

---

## Removal of Potrace

Due to licensing requirements, we are removing the [Potrace library](https://potrace.sourceforge.net/) usage from Gatsby. Potrace is used in Gatsby's image transformations, specifically for creating a SVG placeholder. For example, in `gatsby-plugin-image` you were able to use it with `tracedSvg` and `TRACED_SVG` respectively.

These are the affected libraries/plugins:

- gatsby-plugin-sharp
- gatsby-transformer-sharp
- gatsby-plugin-utils
- gatsby-remark-images

There will be **no API-breaking changes**, your builds will continue to work. However, whenever you use the `tracedSvg` feature Gatsby automatically falls back to the default placeholder style now. In most instances this is `DOMINANT_COLOR`. You'll see a detailed warning message in your CLI about this, too.

If you’d like to know more or have any questions, head over to our [Github Discussion](https://gatsby.dev/tracesvg-removal).

## Notable bugfixes & improvements

- `gatsby-source-wordpress`: `MediaItem.excludeFieldNames` / auto exclude interface types that have no fields, via [PR #37062](https://github.com/gatsbyjs/gatsby/pull/37062)
- `gatsby-source-drupal`: Provide `proxyUrl` in addition to baseUrl to allow using CDN, API gateway, etc., via [PR #36819](https://github.com/gatsbyjs/gatsby/pull/36819)
- `gatsby-cli`: We changed our error messages a little bit. You should see a more detailed `type` beside the error ID now
- `gatsby`: Sanitize `length` on objects, via [PR #34253](https://github.com/gatsbyjs/gatsby/pull/34253)

## Contributors

A big **Thank You** to [our community who contributed][full-changelog] to this release 💜

- [MichaelDeBoey](https://github.com/MichaelDeBoey): tests: Update pluginOptionsSchema tests [PR #27904](https://github.com/gatsbyjs/gatsby/pull/27904)
- [sampittko](https://github.com/sampittko): docs: add onCreateNode params and example [PR #27503](https://github.com/gatsbyjs/gatsby/pull/27503)
- [benomatis](https://github.com/benomatis): fix(gatsby-plugin-google-gtag): correct script to match google's current [PR #36993](https://github.com/gatsbyjs/gatsby/pull/36993)
- [vse-volod](https://github.com/vse-volod): chore(docs): Update "Working with Images in Markdown" [PR #34621](https://github.com/gatsbyjs/gatsby/pull/34621)
- [Nischal2015](https://github.com/Nischal2015): chore(docs): add missing argument [PR #37063](https://github.com/gatsbyjs/gatsby/pull/37063)
- [aaronadamsCA](https://github.com/aaronadamsCA): chore(gatsby-plugin-image): Add `peerDependenciesMeta` [PR #35146](https://github.com/gatsbyjs/gatsby/pull/35146)
- [hexpunk](https://github.com/hexpunk): fix(gatsby-remark-graphviz) Fix attribute application [PR #36391](https://github.com/gatsbyjs/gatsby/pull/36391)
- [PeterDekkers](https://github.com/PeterDekkers): chore(gatsby-plugin-sitemap): Clarify filterPages' reliance on the excludes array [PR #37065](https://github.com/gatsbyjs/gatsby/pull/37065)
- [aryans1319](https://github.com/aryans1319): chore(docs): Example `@link` directive with array (by elemMatch) [PR #36632](https://github.com/gatsbyjs/gatsby/pull/36632)
- [Vacilando](https://github.com/Vacilando): feat(gatsby-source-drupal): Provide proxyUrl in addition to baseUrl to allow using CDN, API gateway, etc. [PR #36819](https://github.com/gatsbyjs/gatsby/pull/36819)
- [iChenLei](https://github.com/iChenLei): fix(gatsby): Sanitize `length` on objects [PR #34253](https://github.com/gatsbyjs/gatsby/pull/34253)
- [DarthFloopy](https://github.com/DarthFloopy): chore(gatsby-source-contentful): Add note about RichTextField to README [PR #36102](https://github.com/gatsbyjs/gatsby/pull/36102)

[full-changelog]: https://github.com/gatsbyjs/gatsby/compare/gatsby@5.2.0-next.0...gatsby@5.2.0
