---
date: "2022-09-27"
version: "4.24.0"
title: "v4.24 Release Notes"
---

Welcome to `gatsby@4.24.0` release (September 2022 #2)

Key highlights of this release:

- [Gatsby 5 Alpha](#gatsby-5-alpha)
- [Updating File System Routes on data changes](#updating-file-system-routes-on-data-changes)

Also check out [notable bugfixes](#notable-bugfixes--improvements).

**Bleeding Edge:** Want to try new features as soon as possible? Install `gatsby@next` and let us know if you have any [issues](https://github.com/gatsbyjs/gatsby/issues).

[Previous release notes](/docs/reference/release-notes/v4.23)

[Full changelog][full-changelog]

---

## Gatsby 5 Alpha

You probably noticed that in the last couple of releases we mostly focused on bug fixes, smaller improvements, and pointing to our RFCs rather than shipping big new features. There's a simple reason for that: We're working hard on Gatsby 5! And we're super excited to share that you can [try the Gatsby 5 Alpha](https://github.com/gatsbyjs/gatsby/discussions/36609) today 🎉

For the Alpha the big new feature you'll be able to test out is [Partial Hydration](https://github.com/gatsbyjs/gatsby/discussions/36608). With Partial Hydration you gain the ability to mark specific parts of your site/application as “interactive”, while the rest of your site is static by default. This will result in shipping less JavaScript to your users and improved Lighthouse scores.

Please take part in the [Gatsby 5 Umbrella Discussion](https://github.com/gatsbyjs/gatsby/discussions/36609), **try it out**, and let us know what works and doesn't work. If Discord is more your jam, you can also join the [`gatsby-5` Discord channel](https://discord.gg/MhfpnT4cNg).

## Updating File System Routes on data changes

When creating routes using the [File System Route API](/docs/reference/routing/file-system-route-api/) they were correctly created on initial run with `gatsby develop`. However, on subsequent changes to the underlying sourced data (e.g. Markdown files have their `slug` field changed) those changes weren't reflected in the routes. A restart of `gatsby develop` was necessary.

In [PR #36623](https://github.com/gatsbyjs/gatsby/pull/36623) we fixed this behavior and any node changes (either by changing local files or through webhook updates) will be reflected in your routes.

## Notable bugfixes & improvements

- `gatsby-plugin-mdx`: Fix the `React is not defined` error, via [PR #36595](https://github.com/gatsbyjs/gatsby/pull/36595)
- `gatsby-remark-copy-linked-files`: Add `absolutePath` to `dir` function, via [PR #36213](https://github.com/gatsbyjs/gatsby/pull/36213)
- `gatsby` & `gatsby-plugin-mdx`: Fix "Multiple root query" error when using a name for your MDX template, via [PR #36525](https://github.com/gatsbyjs/gatsby/pull/36525)
- `gatsby-parcel-config`: The underlying Parcel config (used for compiling `gatsby-config.ts` and `gatsby-node.ts` files) was changed to only handle JavaScript/TypeScript. This aligns the behavior with current Node.js capabilities of `gatsby-config.js`/`gatsby-node.js` (e.g. you can't just import YAML files), via [PR #36583](https://github.com/gatsbyjs/gatsby/pull/36583)
- `gatsby`: Source maps are available for `gatsby-config.ts`/`gatsby-node.ts` files, via [PR #36450](https://github.com/gatsbyjs/gatsby/pull/36450)

## Contributors

A big **Thank You** to [our community who contributed][full-changelog] to this release 💜

TODO

[full-changelog]: https://github.com/gatsbyjs/gatsby/compare/gatsby@4.24.0-next.0...gatsby@4.24.0
