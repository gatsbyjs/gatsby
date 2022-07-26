---
date: "2022-02-08"
version: "4.7.0"
title: "v4.7 Release Notes"
---

Welcome to `gatsby@4.7.0` release (February 2022 #1)

Key highlights of this release:

- [`trailingSlash` Option (Beta)](#trailingslash-option) - Now built into the Framework itself
- [Faster Schema Creation & `createPages`](#faster-schema-creation--createpages) - Speed improvements of at least 30%

Also check out [notable bugfixes](#notable-bugfixes--improvements).

**Bleeding Edge:** Want to try new features as soon as possible? Install `gatsby@next` and let us know
if you have any [issues](https://github.com/gatsbyjs/gatsby/issues).

[Previous release notes](/docs/reference/release-notes/v4.6)

[Full changelog][full-changelog]

---

## `trailingSlash` Option

_Currently in Public Beta_

Through the RFC [Integrated handling of trailing slashes in Gatsby](https://github.com/gatsbyjs/gatsby/discussions/34205) we've worked on making the trailing slashes feature a first-class citizen in Gatsby. We're happy to announce that `gatsby-config` now supports a `trailingSlash` configuration with these three main options:

- `always`: Always add trailing slashes to each URL, e.g. `/x` to `/x/`.
- `never`: Remove all trailing slashes on each URL, e.g. `/x/` to `/x`.
- `ignore`: Don't automatically modify the URL

You can set it like this:

```js:title=gatsby-config.js
module.exports = {
  trailingSlash: "always"
}
```

Throughout Gatsby 4 the default setting for `trailingSlash` will be `legacy` (to keep the current behavior) but with Gatsby 5 we'll remove the `legacy` setting and make `always` the default. Please note that these plugins are considered deprecated now: [gatsby-plugin-force-trailing-slashes](/plugins/gatsby-plugin-force-trailing-slashes/) and [gatsby-plugin-remove-trailing-slashes](/plugins/gatsby-plugin-remove-trailing-slashes/).

Gatsby Cloud supports this new setting out of the box and also uses `301` redirects to bring visitors to the right location. Locally you can use `gatsby serve` to see the behavior. Any other hosting provider (or if you’re managing this on your own) should follow the “Redirects, and expected behavior from the hosting provider” section on the [initial RFC](https://github.com/gatsbyjs/gatsby/discussions/34205).

If you're unit testing `gatsby-link` you'll need to update the `moduleNameMapper` option to include `gatsby-page-utils`, see [Unit Testing documentation](/docs/how-to/testing/unit-testing/#2-creating-a-configuration-file-for-jest) for more details.

The information presented here is also available in the [gatsby-config docs page](/docs/reference/config-files/gatsby-config/#trailingslash) and in the [PR #34268](https://github.com/gatsbyjs/gatsby/pull/34268) that implemented this.

Please share your feedback and any issues you encounter directly into the [corresponding discussion](https://github.com/gatsbyjs/gatsby/discussions/34205).

## Faster Schema Creation & `createPages`

We've seen a handful of sites struggling with long `schema building` and `createPages` steps. In this release, we've upgraded our external [`graphql-compose`](https://graphql-compose.github.io/) dependency to v9 to improve these steps by at least 30-50% for schemas/queries with many relationships. For example, one of our customers has seen improvements for `createPages` of 786s to 20s. This update is recommended to everyone and doesn't necessitate any changes on your end.

More information can be found in the [PR #34504](https://github.com/gatsbyjs/gatsby/pull/3504).

## Notable Bugfixes & Improvements

- `gatsby`:
  - Handle `export const` syntax in pages and don't remove `config` exports in non-pages, via [PR #34581](https://github.com/gatsbyjs/gatsby/pull/34581) & [PR #34582](https://github.com/gatsbyjs/gatsby/pull/34582)
  - Fix an issue using a `eq: $id` filter with files, via [PR #34693](https://github.com/gatsbyjs/gatsby/pull/34693)
- `gatsby-plugin-fullstory`: Updated snippet, via [PR #34583](https://github.com/gatsbyjs/gatsby/pull/34583)
- `gatsby-core-utils`: Remote file downloads are now queued properly for all cases, via [PR #34414](https://github.com/gatsbyjs/gatsby/pull/34414)
- `gatsby-plugin-preact`: Fix alias for `react-dom/server`, via [PR #34694](https://github.com/gatsbyjs/gatsby/pull/34694)
- Added a `vanilla-extract` example project, via [PR #34667](https://github.com/gatsbyjs/gatsby/pull/34667)

## Contributors

A big **Thank You** to [our community who contributed][full-changelog] to this release 💜

- [josephjosedev](https://github.com/josephjosedev)
  - chore(docs): typo fix [PR #34565](https://github.com/gatsbyjs/gatsby/pull/34565)
  - chore(docs): Update starters doc [PR #34614](https://github.com/gatsbyjs/gatsby/pull/34614)
- [axe312ger](https://github.com/axe312ger)
  - fix(react-docgen): run user handlers before default ones [PR #34286](https://github.com/gatsbyjs/gatsby/pull/34286)
  - fix: ensure remote file downloads are queued in all cases [PR #34414](https://github.com/gatsbyjs/gatsby/pull/34414)
  - fix(contentful): support Content Types named Tag [PR #34585](https://github.com/gatsbyjs/gatsby/pull/34585)
  - test: clean up and refactor Contentful unit tests [PR #34584](https://github.com/gatsbyjs/gatsby/pull/34584)
  - Fix: Contentful warm builds [PR #34678](https://github.com/gatsbyjs/gatsby/pull/34678)
- [seanparmelee](https://github.com/seanparmelee)
  - fix(gatsby-plugin-fullstory): update snippet [PR #34583](https://github.com/gatsbyjs/gatsby/pull/34583)
  - chore(docs): fix links to repo instructions [PR #34629](https://github.com/gatsbyjs/gatsby/pull/34629)
  - chore(docs): fix links on styling-css page [PR #34390](https://github.com/gatsbyjs/gatsby/pull/34390)
- [millette](https://github.com/millette): chore(gatsby-source-wordpress): Add WPGraphQL WPML [PR #34609](https://github.com/gatsbyjs/gatsby/pull/34609)
- [jeffreyvdhondel](https://github.com/jeffreyvdhondel): feat(gatsby-plugin-google-gtag): add selfHostedOrigin option [PR #34352](https://github.com/gatsbyjs/gatsby/pull/34352)
- [Rutam21](https://github.com/Rutam21): fix(gatsby): fixes stacktraces from async functions break error reporting [PR #33712](https://github.com/gatsbyjs/gatsby/pull/33712)
- [rschristian](https://github.com/rschristian): fix(gatsby-plugin-preact): Adding missing alias for `react/jsx-runtime` [PR #34666](https://github.com/gatsbyjs/gatsby/pull/34666)
- [tamaosa](https://github.com/tamaosa): fix(gatsby-plugin-preact): Fix alias for react-dom/server [PR #34694](https://github.com/gatsbyjs/gatsby/pull/34694)- [ollybenson](https://github.com/ollybenson): chore(docs): Update gatsby-plugin-image to mention local data source [PR #34426](https://github.com/gatsbyjs/gatsby/pull/34426)
- [rileyjshaw](https://github.com/rileyjshaw): chore(docs): update PurgeCSS instructions for Tailwind 3 [PR #34726](https://github.com/gatsbyjs/gatsby/pull/34726)
- [xaviemirmon](https://github.com/xaviemirmon): chore(docs): Update "Debugging HTML builds" to include `getServerData` [PR #34631](https://github.com/gatsbyjs/gatsby/pull/34631)
- [marceloverdijk](https://github.com/marceloverdijk): chore(docs): Added required `type` attribute to resolver [PR #34716](https://github.com/gatsbyjs/gatsby/pull/34716)
- [cameronbraid](https://github.com/cameronbraid): chore(docs): Update `transformOptions` defaults [PR #34713](https://github.com/gatsbyjs/gatsby/pull/34713)%

[full-changelog]: https://github.com/gatsbyjs/gatsby/compare/gatsby@4.7.0-next.0...gatsby@4.7.0
