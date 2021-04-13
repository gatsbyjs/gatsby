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

Also check out [notable bugfixes](#notable-bugfixes--improvements).

**Bleeding Edge:** Want to try new features as soon as possible? Install `gatsby@next` and let us know
if you have any [issues](https://github.com/gatsbyjs/gatsby/issues).

[Previous release notes](/docs/reference/release-notes/v3.1)

[Full changelog](https://github.com/gatsbyjs/gatsby/compare/gatsby@3.3.0...gatsby@3.3.0)

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
and decrease spikes in memory usage — especially for sites with many 100s+ pages and large page-data.json files. With our example site we saw a decrease in peak memory usage from
~3.5 GB to ~1.7 GB (without negative effects to build time).

[Original PR](https://github.com/gatsbyjs/gatsby/pull/30793)

## Upgrade to the latest `remark`

Remark has had a significant [major upgrade](https://github.com/remarkjs/remark/releases/tag/13.0.0)
recently (version 13) and changed the underlying parser. The ecosystem has almost [caught up](https://github.com/remarkjs/remark/blob/main/doc/plugins.md#list-of-plugins)
since then, so we've decided to release new major versions of all our `remark` plugins.

The following plugins are now fully compatible with `remark@13`:

- **gatsby-transformer-remark@4.0.0**
- gatsby-remark-autolink-headers@4.0.0
- gatsby-remark-code-repls@5.0.0
- gatsby-remark-copy-linked-files@4.0.0
- gatsby-remark-embed-snippet@6.0.0
- gatsby-remark-graphviz@3.0.0
- gatsby-remark-images-contentful@4.0.0
- gatsby-remark-images@5.0.0
- gatsby-remark-katex@5.0.0
- gatsby-remark-prismjs@5.0.0
- gatsby-remark-responsive-iframe@4.0.0
- gatsby-remark-smartypants@4.0.0

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
Unfortunately there is no Gatsby plugin for it yet. But if you decide to build one - please let us
know in the [umbrella discussion](https://github.com/gatsbyjs/gatsby/discussions/30385) and we'll link it here.

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

## Notable bugfixes & improvements

- Fixed invalid query results in cached builds [PR #30594](https://github.com/gatsbyjs/gatsby/pull/30594)
- Schema customization: merge fields of interfaces defined by multiple plugins [PR #30501](https://github.com/gatsbyjs/gatsby/pull/30501)
- Fix for IE11: add dom collections to polyfills [PR #30483](https://github.com/gatsbyjs/gatsby/pull/30483)

## Contributors

TODO after backporting all fixes
