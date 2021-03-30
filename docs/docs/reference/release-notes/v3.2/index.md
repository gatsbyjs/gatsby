---
date: "2021-03-30"
version: "3.2.0"
---

# [v3.2](https://github.com/gatsbyjs/gatsby/compare/gatsby@3.2.0-next.0...gatsby@3.2.0) (March 2021 #3)

Welcome to `gatsby@3.2.0` release (March 2021 #3)

Key highlights of this release:

- [Better `StaticImage` errors](#better-staticimage-errors)
- [Adjustable ES Modules option for CSS Modules](#adjustable-es-modules-option-for-css-modules)
- [`gatsby-source-contentful`](#gatsby-source-contentful520) - improved performance and other changes

Also check out [notable bugfixes](#notable-bugfixes).

Sneak peek to next releases:

- [Major bump of all remark plugins](#next-version-major-bump-of-all-remark-plugins)

**Bleeding Edge:** Want to try new features as soon as possible? Install `gatsby@next` and let us know
if you have any [issues](https://github.com/gatsbyjs/gatsby/issues).

[Previous release notes](/docs/reference/release-notes/v3.1)

[Full changelog](https://github.com/gatsbyjs/gatsby/compare/gatsby@3.2.0-next.0...gatsby@3.2.0)

## Better `StaticImage` errors

For our new `gatsby-plugin-image` we also introduced `StaticImage` to allow quick usage of the image pipeline for images that are the same every time. But it comes [with some restrictions](/docs/reference/built-in-components/gatsby-plugin-image/#restrictions-on-using-staticimage) that you need to think of.

To make using `StaticImage` easier the previous error message was adjusted to now also show the offending code and link to the relevant documentation.

![CLI showing an error with a description, a codeframe with the relevant code, and link to documentation](https://user-images.githubusercontent.com/213306/111302367-3a142500-864b-11eb-8768-d46e452e70f1.png)

**Bonus:** If you want to use `StaticImage` as a background image, read our [newly added docs](/docs/how-to/images-and-media/using-gatsby-plugin-image#background-images).

## Adjustable ES Modules option for CSS Modules

With the release of Gatsby v3 we made the choice to [import CSS modules as ES Modules](/docs/reference/release-notes/migrating-from-v2-to-v3/#css-modules-are-imported-as-es-modules) by default. This allows better treeshaking and smaller files as a result -- however, when using third-party packages that still expect CommonJS you'll need to work around this behavior to be able to migrate to Gatsby v3.

Together with v3.2 also new minors of `gatsby-plugin-sass`, `gatsby-plugin-less`, `gatsby-plugin-postcss`, and `gatsby-plugin-stylus` were released. You're now able to override the [`esModule`](https://github.com/webpack-contrib/css-loader#esmodule) and [`namedExport`](https://github.com/webpack-contrib/css-loader#namedexport) option of [`css-loader`](https://github.com/webpack-contrib/css-loader) inside each plugin.

Please see the [migration guide](/docs/reference/release-notes/migrating-from-v2-to-v3/#css-modules-are-imported-as-es-modules) for an example.

## `gatsby-source-contentful@5.2.0`

Features:

- The default limit when fetching data from Contentful was increased by 10 times. This will speed up build times.
- The [`using-contentful`](https://github.com/gatsbyjs/gatsby/tree/master/examples/using-contentful) example got updated to Gatsby v3 and demonstrates how to use [`gatsby-plugin-image`](https://github.com/gatsbyjs/gatsby/tree/master/packages/gatsby-plugin-image) with Contenful.
- New e2e-contentful test suite to improve plugin reliabliity.

Fixes:

- Network errors are properly retried again.
- Set proper defaults when for `gatsby-plugin-image` (Constrained layout with dominant color as placeholder)
- Improved help when connection credentials are wrong
- Improved the docs and added more details about the `downloadLocal` config option

---

## Notable bugfixes & improvements

- Be less aggressive about the [`fs` in SSR usage](https://www.gatsbyjs.com/docs/reference/release-notes/migrating-from-v2-to-v3/#using-fs-in-ssr) warnings, now excluding `http(s).Agent` and `node-gyp-build` [PR #30216](https://github.com/gatsbyjs/gatsby/pull/30216)
- Fixing rendering issues in `gatsby-plugin-image` with the placeholder and component itself [PR #30221](https://github.com/gatsbyjs/gatsby/pull/30221)
- Documentation about [Debugging Incremental Builds](/docs/debugging-incremental-builds/) [PR #30329](https://github.com/gatsbyjs/gatsby/pull/30329)
- Validate plugin options schema also for local plugins [PR #29787](https://github.com/gatsbyjs/gatsby/pull/29787)

---

## Next version: major bump of all remark plugins

Remark has had a significant [major upgrade](https://github.com/remarkjs/remark/releases/tag/13.0.0) recently and changed the underlying parser. The ecosystem seems to have almost [caught up](https://github.com/remarkjs/remark/blob/main/doc/plugins.md#list-of-plugins) since then, so we are going to release a new major version for all remark-related plugins soon.

We tried to make the upgrade effortless but there could still be subtle differences in output and edge cases. So please try pre-release versions of those plugins and [let us know](https://github.com/gatsbyjs/gatsby/discussions/30385) if you notice any inconsistencies or bugs.

Install the following canary versions of all remark packages that you have in your `package.json`:

```
gatsby-remark-autolink-headers@alpha-remark13
gatsby-remark-code-repls@alpha-remark13
gatsby-remark-copy-linked-files@alpha-remark13
gatsby-remark-custom-blocks@alpha-remark13
gatsby-remark-embed-snippet@alpha-remark13
gatsby-remark-graphviz@alpha-remark13
gatsby-remark-images-contentful@alpha-remark13
gatsby-remark-images@alpha-remark13
gatsby-remark-katex@alpha-remark13
gatsby-remark-prismjs@alpha-remark13
gatsby-remark-responsive-iframe@alpha-remark13
gatsby-remark-smartypants@alpha-remark13
gatsby-transformer-remark@alpha-remark13
```

[Umbrella discussion](https://github.com/gatsbyjs/gatsby/discussions/30385)

## Contributors

A big **Thank You** to [our community who contributed](https://github.com/gatsbyjs/gatsby/compare/gatsby@3.2.0-next.0...gatsby@3.2.0) to this release 💜

- [misfist](https://github.com/misfist): chore(starters): Update WordPress blog README [PR #30209](https://github.com/gatsbyjs/gatsby/pull/30209)
- [TngSam](https://github.com/TngSam): chore(docs): Update using-web-fonts [PR #30243](https://github.com/gatsbyjs/gatsby/pull/30243)
- [andrewrota](https://github.com/andrewrota): chore(docs): Fix link to markdown-syntax [PR #30239](https://github.com/gatsbyjs/gatsby/pull/30239)
- [dhrumilp15](https://github.com/dhrumilp15)
  - chore(dosc): Update deploying-to-digitalocean-droplet [PR #30205](https://github.com/gatsbyjs/gatsby/pull/30205)
  - chore(docs): Update deploying-to-digitalocean-droplet [PR #30266](https://github.com/gatsbyjs/gatsby/pull/30266)
- [pedrolamas](https://github.com/pedrolamas): fix(gatsby-plugin-netlify): upgrade webpack-assets-manifest for compatibility with webpack@5 [PR #30217](https://github.com/gatsbyjs/gatsby/pull/30217)
- [Elendev](https://github.com/Elendev): chore(docs): Fix typo in createPages doc [PR #30343](https://github.com/gatsbyjs/gatsby/pull/30343)
- [blenderskool](https://github.com/blenderskool): fix(gatsby): Add reporter.panic in empty catch in load-themes [PR #29640](https://github.com/gatsbyjs/gatsby/pull/29640)
- [UgRoss](https://github.com/UgRoss): fix(gatsby): Fix wrong resolve id for CommentJson type [PR #30389](https://github.com/gatsbyjs/gatsby/pull/30389)
- [larowlan](https://github.com/larowlan): fix(drupal): Support forward revisions for Drupal paragraphs [PR #29289](https://github.com/gatsbyjs/gatsby/pull/29289)
- [kamranayub](https://github.com/kamranayub): fix(gatsby): validate local plugin options schema [PR #29787](https://github.com/gatsbyjs/gatsby/pull/29787)
