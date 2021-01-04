---
date: "2021-01-05"
version: "2.30.0"
---

# [v2.30](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.30.0-next.0...gatsby@2.30.0) (January 2021 #1)

---

Welcome to `gatsby@2.30.0` release (January 2021 #1)

Key highlights of this release:

- [Query on Demand and Lazy Images: Generally available](#query-on-demand-and-lazy-images-generally-available) - improves `gatsby develop` bootup time
- [gatsby-plugin-sass v3](#gatsby-plugin-sass300) - use the latest `sass-loader` and `Dart Sass` by default

And several impactful updates in the new [`gatsby-plugin-image`](#gatsby-plugin-image050-beta) (beta):

- [AVIF support](#avif-support) - enjoy next-gen image format
- [Support remote static images](#support-static-image-urls-experimental) - download, transform and optimize remote images with a single line
- [New defaults](#new-defaults) - less configuration for most common image setups

Also check out [notable bugfixes](#notable-bugfixes).

**Bleeding Edge:** Want to try new features as soon as possible? Install `gatsby@next` and let us know
if you have any [issues](https://github.com/gatsbyjs/gatsby/issues).

[Previous release notes](/docs/reference/release-notes/v2.29)

[Full changelog](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.30.0-next.0...gatsby@2.30.0)

## Query on Demand and Lazy Images: Generally Available

Those two features change the way how `gatsby develop` works:

- We no longer transform all images eagerly on dev server start
- We no longer run all queries

Instead, it happens lazily when the browser requests a page or a specific image variant.
This significantly shortens the boot-up time for `gatsby develop`.

> Note that it does not affect `gatsby build` in any way, only `gatsby develop`

We've been gradually rolling out those features:

- "Query on Demand" was introduced behind the flag in [v2.27](/docs/reference/release-notes/v2.27#experimental-queries-on-demand).
- "Lazy images" were introduced behind the flag in [gatsby-plugin-sharp@2.10.0](/docs/reference/release-notes/v2.28#experimental-lazy-images-in-develop).
- In [v2.29](/docs/reference/release-notes/v2.29#queries-on-demand) 10% of our users were automatically opted-in

This allowed us to collect the feedback and fix bugs as they were discovered.

Now we feel confident enough to publish it as generally available. You don't need to add flags or any environment
variables to enable it. Just upgrade to `gatsby@2.30.0` (and `gatsby-plugin-sharp@2.12.0` for lazy images).

In v2.29 we improved the UX around long-running queries by adding a loading indicator and message to the browser console (only in `gatsby develop`). If you want or need to de-activate this indicator, you can! For more details please see the [umbrella discussion](https://github.com/gatsbyjs/gatsby/discussions/27620).

## gatsby-plugin-sass@3.0.0

Now that [LibSass and Node Sass are deprecated](https://sass-lang.com/blog/libsass-is-deprecated), we've
upgraded `sass-loader` to `10.1.0` and thus switched sass implementation to [Dart Sass](https://sass-lang.com/dart-sass).

The plugin itself is compatible with the previous version. For the majority of projects the upgrade
won't require any special actions.

But keep in mind that **Dart Sass** may still have subtle differences in some edge cases comparing to **Node Sass**,
so if you encounter any issues make sure to check out ["How do I migrate section"](https://sass-lang.com/blog/libsass-is-deprecated#how-do-i-migrate) in sass docs.

See also:

- https://github.com/gatsbyjs/gatsby/issues/27754
- https://github.com/gatsbyjs/gatsby/pull/27991

## gatsby-plugin-image@0.5.0 (beta)

### AVIF support

TODOC

### Support static image URLs (experimental)

Adds initial remote image support to `StaticImage`. To enable, pass `GATSBY_EXPERIMENTAL_REMOTE_IMAGES`

API:

```js
<StaticImage src="https://placekitten.com/400/400" alt="Kittin" />
```

### New defaults

TODOC

## Notable bugfixes

- Display meaningful message on errors when writing base64 images, via [#28614](https://github.com/gatsbyjs/gatsby/pull/28614)
- Fix broken VS Code debugger, via [#28643](https://github.com/gatsbyjs/gatsby/pull/28643)
- Always add both `childField` and `childrenField` in GraphQL to avoid schema inference errors, via [#28656](https://github.com/gatsbyjs/gatsby/pull/28656)
- Fix obscure `undefined failed` message for webpack compilation errors, via [#28701](https://github.com/gatsbyjs/gatsby/pull/28701)
- `gatsby-source-graphql`: add HTTP error reporting, via [#28786](https://github.com/gatsbyjs/gatsby/pull/28786)
- `gatsby-source-filesystem`: Retry a download in `createRemoteFileNode` if a file is incomplete, via [#28547](https://github.com/gatsbyjs/gatsby/pull/28547)
- `gatsby-plugin-schema-snapshot`: fix warning `The type Foo does not explicitly define the field childBar`, via [#28483](https://github.com/gatsbyjs/gatsby/pull/28483)
- `gatsby-source-contentful`: dont re-create nodes unnecessarily, via [#28642](https://github.com/gatsbyjs/gatsby/pull/28642)

## Contributors

A big **Thank You** to [our community who contributed](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.30.0-next.0...gatsby@2.30.0) to this release 💜

- [mdb571](https://github.com/mdb571): docs: update styling-css.md [PR #28581](https://github.com/gatsbyjs/gatsby/pull/28581)
- [erezrokah](https://github.com/erezrokah): chore(plugin-netlify-cms): update Slack link [PR #28529](https://github.com/gatsbyjs/gatsby/pull/28529)
- [ax-vasquez](https://github.com/ax-vasquez): Fix broken import statement (#28611) [PR #28611](https://github.com/gatsbyjs/gatsby/pull/28611)
- [runningdeveloper](https://github.com/runningdeveloper): Fixed typo brackets in file-system-route-api.md [PR #28612](https://github.com/gatsbyjs/gatsby/pull/28612)
- [herecydev](https://github.com/herecydev): chore: update ink to v3 [PR #26190](https://github.com/gatsbyjs/gatsby/pull/26190)
- [gugu](https://github.com/gugu): feat(gatsby): Add AVIF file support to image loader in webpack config [PR #28638](https://github.com/gatsbyjs/gatsby/pull/28638)
- [angristan](https://github.com/angristan): fix(docs): dead links sourcing-data -> querying-data [PR #28651](https://github.com/gatsbyjs/gatsby/pull/28651)
- [jbampton](https://github.com/jbampton): docs: fix spelling [PR #28665](https://github.com/gatsbyjs/gatsby/pull/28665)
- [connor4312](https://github.com/connor4312): fix(gatsby): Do not activate inspect if already active [PR #28643](https://github.com/gatsbyjs/gatsby/pull/28643)
- [antoinerousseau](https://github.com/antoinerousseau): feat(gatsby-source-graphql): Default Apollo Link fetch wrapper to show better API errors [PR #28786](https://github.com/gatsbyjs/gatsby/pull/28786)
