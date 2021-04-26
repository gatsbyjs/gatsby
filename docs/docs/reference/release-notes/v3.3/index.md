---
date: "2021-04-13"
version: "3.3.0"
---

# [v3.3](https://github.com/gatsbyjs/gatsby/compare/gatsby@3.3.0...gatsby@3.3.0) (April 2021 #1)

Welcome to `gatsby@3.3.0` release (April 2021 #1)

Key highlights of this release:

- [Performance optimizations](#performance-optimizations) - faster JS bundling, lower peak memory usage
- [Upgrade to the latest `sharp`](#upgrade-to-the-latest-sharp) - built-in image optimizations; and now works on M1 Macs
- [Upgrade to the latest `remark`](#upgrade-to-the-latest-remark) - more consistency in Markdown rendering
- [Bugfixes in `gatsby-plugin-image`](#bugfixes-in-gatsby-plugin-image130)

Also check out [notable bugfixes](#notable-bugfixes--improvements).

**Bleeding Edge:** Want to try new features as soon as possible? Install `gatsby@next` and let us know
if you have any [issues](https://github.com/gatsbyjs/gatsby/issues).

[Previous release notes](/docs/reference/release-notes/v3.2)

[Full changelog](https://github.com/gatsbyjs/gatsby/compare/gatsby@3.3.0-next.0...gatsby@3.3.0)

---

## Performance optimizations

### Faster JS bundling

This release adds memoization of babel loader options. It significantly reduces the overhead in JS compilation step.
With our sample site we saw a speed-up in JS bundling up to 30-40%

Note: this improvement only affects JS bundling, so if you use other heavy transformations (CSS-in-JS, Mdx, etc),
you will likely see modest improvements.

[Original PR](https://github.com/gatsbyjs/gatsby/pull/28738/)

### Lower peak memory usage

This release restricts concurrency of html-file generation which can greatly reduce memory and disk pressure
and decrease spikes in memory usage — especially for sites with many 100s+ pages and large page-data.json files. With our example site we saw a decrease in peak memory usage from ~3.5 GB to ~1.7 GB (without negative effects to build time).

[Original PR](https://github.com/gatsbyjs/gatsby/pull/30793)

## Upgrade to the latest `remark`

Remark has had a significant [major upgrade](https://github.com/remarkjs/remark/releases/tag/13.0.0)
recently (version 13) and changed the underlying parser. The ecosystem has almost [caught up](https://github.com/remarkjs/remark/blob/main/doc/plugins.md#list-of-plugins)
since then, so we've decided to release new major versions of all our `remark` plugins.

The following plugins are now fully compatible with `remark@13`:

- `gatsby-transformer-remark@4.0.0`
- `gatsby-remark-autolink-headers@4.0.0`
- `gatsby-remark-code-repls@5.0.0`
- `gatsby-remark-copy-linked-files@4.0.0`
- `gatsby-remark-embed-snippet@6.0.0`
- `gatsby-remark-graphviz@3.0.0`
- `gatsby-remark-images-contentful@4.0.0`
- `gatsby-remark-images@5.0.0`
- `gatsby-remark-katex@5.0.0`
- `gatsby-remark-prismjs@5.0.0`
- `gatsby-remark-responsive-iframe@4.0.0`
- `gatsby-remark-smartypants@4.0.0`

We've tried to make the migration effortless and non-breaking (just update the dependencies)
but there are subtle differences in HTML output caused by the new remark parser.
We've identified and listed the most common differences [in this discussion](https://github.com/gatsbyjs/gatsby/discussions/30385)
(if you spot other notable changes - please comment there!)

Also check out [remark changelog](https://github.com/remarkjs/remark/releases/tag/13.0.0), specifically the section: "Changes to output / the tree".

### Incompatible plugin: gatsby-remark-custom-blocks

The only plugin provided by Gatsby that is not compatible yet with `remark@13` is
[`gatsby-remark-custom-blocks`](https://www.gatsbyjs.com/plugins/gatsby-remark-custom-blocks/).
This plugin relies on the upstream remark plugin `remark-custom-blocks` which is itself not compatible with
`remark@13` yet.

The work on updating it is [in progress](https://github.com/zestedesavoir/zmarkdown/issues/416)
though, and as soon as it is finished we will publish the new major version for our plugin as well.

In the meantime if you use this plugin you can just wait when it's ready or modify your markdown
and switch to another syntax. Remark authors [suggest](https://github.com/remarkjs/remark/blob/main/doc/plugins.md#list-of-plugins)
using [`remark-directive`](https://github.com/remarkjs/remark-directive) as an alternative.
Use [`to-gatsby-remark-plugin`](https://www.npmjs.com/package/to-gatsby-remark-plugin) package to convert it to Gatsby remark plugin.

- [Umbrella discussion](https://github.com/gatsbyjs/gatsby/discussions/30385)
- [Original PR](https://github.com/gatsbyjs/gatsby/pull/29678)

---

## Upgrade to the latest `sharp`

Check out [Sharp changelog](https://github.com/lovell/sharp/blob/ed5d753b89e5649b1586de04ffef6ec903942a64/docs/changelog.md#v028---bijou)
for a full list of changes.

The most important highlights of the new release:

- Smaller install size
- Supports Mac M1: now uses prebuilt libvips binaries for M1 Macs
- Includes buil-in image optimization (unlocks future perf improvements in Gatsby)

[Original PR](https://github.com/gatsbyjs/gatsby/pull/30541)

## Bugfixes in `gatsby-plugin-image@1.3.0`

- Fix a bug that caused errors in third party packages that access the `global` object
- Fix a bug that prevented `draggable="false"` being set on the `GatsbyImage` component
- Fix a bug that caused blurred previews to be generated at the wrong aspect ratio
- Fix a bug that prevented lazy-loaded images displaying in Safari
- Fix a bug that caused duplicate type errors when using Contentful images with other plugins that implement images

## Notable bugfixes & improvements

- Fixed invalid query results in cached builds [PR #30594](https://github.com/gatsbyjs/gatsby/pull/30594)
- Schema customization: merge fields of interfaces defined by multiple plugins [PR #30501](https://github.com/gatsbyjs/gatsby/pull/30501)
- Fix for IE11: add dom collections to polyfills [PR #30483](https://github.com/gatsbyjs/gatsby/pull/30483)

## Contributors

A big **Thank You** to [our community who contributed](https://github.com/gatsbyjs/gatsby/compare/gatsby@3.3.0-next.0...gatsby@3.3.0) to this release 💜

- [JobenM](https://github.com/JobenM): fix(gatsby-plugin-mdx): timeToRead returns NaN when word count is 0 [PR #30489](https://github.com/gatsbyjs/gatsby/pull/30489)
- [axe312ger](https://github.com/axe312ger)

  - fix(gatsby-source-contentful): Improve network error handling [PR #30257](https://github.com/gatsbyjs/gatsby/pull/30257)
  - chore(contentful): create compiled files in dist instead of . [PR #30414](https://github.com/gatsbyjs/gatsby/pull/30414)
  - fix(examples): Update using-contentful to use gatsby-plugin-image [PR #29526](https://github.com/gatsbyjs/gatsby/pull/29526)
  - build(using-contentful): add missing sharp dependency [PR #30546](https://github.com/gatsbyjs/gatsby/pull/30546)
  - feat(gatsby-source-contentful): Increase Contentful sync by up to 10x [PR #30422](https://github.com/gatsbyjs/gatsby/pull/30422)
  - fix(contentful): set proper defaults for gatsby-plugin-image [PR #30536](https://github.com/gatsbyjs/gatsby/pull/30536)
  - feat(gatsby-source-contentful): update docs and improve errors [PR #30538](https://github.com/gatsbyjs/gatsby/pull/30538)
  - fix(gatsby-source-contentful): Contentful page limit backoff [PR #30549](https://github.com/gatsbyjs/gatsby/pull/30549)
  - fix(contentful): ensure fragments are properly distributed [PR #30555](https://github.com/gatsbyjs/gatsby/pull/30555)
  - fix(using-contentful): clean up dependencies [PR #30556](https://github.com/gatsbyjs/gatsby/pull/30556)
  - fix(contentful): make gatsby-plugin-image a peer dependency [PR #30709](https://github.com/gatsbyjs/gatsby/pull/30709)

- [ridem](https://github.com/ridem): fix(gatsby-plugin-netlify-cms): Don't use StaticQueryMapper [PR #30599](https://github.com/gatsbyjs/gatsby/pull/30599)
- [Nurou](https://github.com/Nurou): chore(gatsby-source-wordpress): Link to source WP plugin [PR #30645](https://github.com/gatsbyjs/gatsby/pull/30645)
- [baker-jr-john](https://github.com/baker-jr-john): chore(docs): Update how-gatsby-works-with-github-pages [PR #30630](https://github.com/gatsbyjs/gatsby/pull/30630)
- [cametumbling](https://github.com/cametumbling)

  - chore(docs): Add link to part 8 tutorial [PR #30604](https://github.com/gatsbyjs/gatsby/pull/30604)
  - chore(docs): Update wording of tutorial part 8 [PR #30606](https://github.com/gatsbyjs/gatsby/pull/30606)

- [nategiraudeau](https://github.com/nategiraudeau): fix(gatsby-example-using-remark) fix broken example for typescript users [PR #30505](https://github.com/gatsbyjs/gatsby/pull/30505)
- [AntonNiklasson](https://github.com/AntonNiklasson): chore(docs): include autoprefixer in tailwind install command [PR #30718](https://github.com/gatsbyjs/gatsby/pull/30718)
