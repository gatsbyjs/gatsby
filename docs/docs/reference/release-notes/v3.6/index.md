---
date: "2021-05-25"
version: "3.6.0"
---

# [v3.6](https://github.com/gatsbyjs/gatsby/compare/gatsby@3.6.0-next.0...gatsby@3.6.0) (May 2021 #2)

Welcome to `gatsby@3.6.0` release (May 2021 #2)

Key highlights of this release:

- [Functions](#functions) - now supported in Plugins and Themes! Multiple performance and DX improvements.
- [Preview Status Indicator](#preview-status-indicator) - Design upgrade and added functionality.

Also check out [notable bugfixes](#notable-bugfixes--improvements).

**Bleeding Edge:** Want to try new features as soon as possible? Install `gatsby@next` and let us know
if you have any [issues](https://github.com/gatsbyjs/gatsby/issues).

[Previous release notes](/docs/reference/release-notes/v3.5)

[Full changelog](https://github.com/gatsbyjs/gatsby/compare/gatsby@3.6.0-next.0...gatsby@3.6.0)

---

## Functions

This is a feature-packed release for [Functions](/docs/how-to/functions/)! Since Gatsby v3.4 you can enable them as a flag in your `gatsby-config.js` ([learn more in the discussion](https://github.com/gatsbyjs/gatsby/discussions/30735)).

Gatsby plugins (and thus also Gatsby themes) can ship serverless functions now ([PR #31466](https://github.com/gatsbyjs/gatsby/pull/31466)). Place them inside `src/api/%pluginName%/` and your users will be able to call them at `/api/%pluginName%/` -- this unlocks powerful plug-and-play opportunities like e-commerce themes that ship with frontend and backend logic. We're eager to see in the [discussion](https://github.com/gatsbyjs/gatsby/discussions/30735) what you're building.

Functions also support uploading files as part of forms with this release ([PR #31470](https://github.com/gatsbyjs/gatsby/pull/31470)). You can access the data at `req.files`.

Last but not least we shipped multiple performance & DX improvements to Functions. We [disabled minifaction](https://github.com/gatsbyjs/gatsby/pull/31473) of functions to speed up the build, [enabled](https://github.com/gatsbyjs/gatsby/pull/31505) webpack 5 `filesystem` caching, and [lazily compile functions](https://github.com/gatsbyjs/gatsby/pull/31508) in development to ensure a fast bootstrap.

## Preview Status Indicator

With the latest release, we introduce our newest design for the preview status indicator. As with the previous indicator, you will need the latest version of `gatsby-plugin-gatsby-cloud` to be installed and configured in your `gatsby-config.js` file.

This indicator will show up on your previews hosted on Gatsby Cloud. There are 4 interactable states to alert to the user the state of their preview builds as well as giving more context to when things succeed or go wrong.

This only works with our next gen preview which is currently in the middle of being rolled out to all sites.

![Showing the different states that the Preview Indicator can take. It's a rectangular container with three vertically stacked icons. The first icon is the Gatsby logo, the second icon indicates a link, and the third icon is an information icon. The Gatsby logo can indicate that the preview information is getting fetched, that a new preview is available, and that the preview has an error. In this case you can view logs. The link icon let's you copy the current URL path to share. The information icon tells you when the preview was last updated.](https://user-images.githubusercontent.com/16143594/119472866-e741a280-bd4a-11eb-9845-2bd9007070ab.jpg)

## Notable bugfixes & improvements

- `gatsby-source-wordpress`: Add `searchAndReplace` feature, via [PR #31091](https://github.com/gatsbyjs/gatsby/pull/31091).
- `gatsby-plugin-sitemap`: Fixes a bug where sitemaps were being written in a sub-directory but the sitemap index didn't contain that sub-directory, via [PR #31184](https://github.com/gatsbyjs/gatsby/pull/31184). Also remove `reporter.verbose` calls that would spam your Gatsby Cloud logs, via [PR #31448](https://github.com/gatsbyjs/gatsby/pull/31448).
- `gatsby-source-drupal`: Add toggleable multilingual support by prefixing nodes with their langcode, via [PR #26720](https://github.com/gatsbyjs/gatsby/pull/26720).
- `gatsby-plugin-image`: Remove extra "margin" on `CONSTRAINED` images, via [PR #31497](https://github.com/gatsbyjs/gatsby/pull/31497).
- `gatsby-source-contentful`: Use correct parameter for "focus" & fix dominant color on cropped images, via [PR #31492](https://github.com/gatsbyjs/gatsby/pull/31492).

## Contributors

A big **Thank You** to [our community who contributed](https://github.com/gatsbyjs/gatsby/compare/gatsby@3.6.0-next.0...gatsby@3.6.0) to this release 💜

- [hoobdeebla](https://github.com/hoobdeebla): fix(tests): update cheerio snapshots [PR #31298](https://github.com/gatsbyjs/gatsby/pull/31298)
- [lukashass](https://github.com/lukashass): chore(gatsby-plugin-sitemap): fix typos [PR #31351](https://github.com/gatsbyjs/gatsby/pull/31351)
- [angeloashmore](https://github.com/angeloashmore): fix(gatsby-plugin-page-creator): support index routes when using the File System Route API [PR #31339](https://github.com/gatsbyjs/gatsby/pull/31339)
- [jooola](https://github.com/jooola)
  - feat(gatsby-source-wordpress): Add searchAndReplace [PR #31091](https://github.com/gatsbyjs/gatsby/pull/31091)
  - fix(gatsby-source-wordpress): Remove search and replace regex literal recommendation [PR #31413](https://github.com/gatsbyjs/gatsby/pull/31413)
- [DaleSeo](https://github.com/DaleSeo): chore(docs): Fix missing closing code fence [PR #31404](https://github.com/gatsbyjs/gatsby/pull/31404)
- [camro](https://github.com/camro): Update typo in docs [PR #31405](https://github.com/gatsbyjs/gatsby/pull/31405)
- [ascorbic](https://github.com/ascorbic): fix(gatsby-cli): Switch host env to GATSBY_ prefix [PR #31426](https://github.com/gatsbyjs/gatsby/pull/31426)
- [saintmalik](https://github.com/saintmalik): chore(docs): Update "choosing a CMS" [PR #31429](https://github.com/gatsbyjs/gatsby/pull/31429)
- [Hahlh](https://github.com/Hahlh): chore(gatsby-plugin-google-gtag): Fix typo [PR #31431](https://github.com/gatsbyjs/gatsby/pull/31431)
- [moonmeister](https://github.com/moonmeister): fix(gatsby-plugin-sitemap): Sitemap path bug [PR #31184](https://github.com/gatsbyjs/gatsby/pull/31184)
- [NickBarreto](https://github.com/NickBarreto): chore(docs): Fixing JSON in configuration options [PR #31460](https://github.com/gatsbyjs/gatsby/pull/31460)
- [smurrayatwork](https://github.com/smurrayatwork): Fixes a bug related to filters appended onto next links for gatsby-source-drupal. [PR #31350](https://github.com/gatsbyjs/gatsby/pull/31350)
- [Auspicus](https://github.com/Auspicus): feat(gatsby-source-drupal): Add toggleable multilingual support by prefixing nodes with their langcode [PR #26720](https://github.com/gatsbyjs/gatsby/pull/26720)
- [klaasvw](https://github.com/klaasvw): Fixes filenames imported from Drupal via jsonapi are saved URL encoded. [PR #31425](https://github.com/gatsbyjs/gatsby/pull/31425)
- [axe312ger](https://github.com/axe312ger): update Contentful e2e test snapshots [PR #31073](https://github.com/gatsbyjs/gatsby/pull/31073)
- [jgosmann](https://github.com/jgosmann): fix(gatsby-transformer-sharp): Dereference symlinks when copying files [PR #31511](https://github.com/gatsbyjs/gatsby/pull/31511)
- [ekathuria](https://github.com/ekathuria): chore(docs): Update adding-search [PR #31512](https://github.com/gatsbyjs/gatsby/pull/31512)
