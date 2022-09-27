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

For the Alpha the big new feature you'll be able to test out is [Partial Hydration](https://github.com/gatsbyjs/gatsby/discussions/36608). With Partial Hydration you gain the ability to mark specific parts of your site/application as “interactive”, while the rest of your site is static by default. This will result in shipping less JavaScript to your users and improved Lighthouse scores. For a quick preview of these great features, you can [watch the showcase on YouTube](https://www.youtube.com/watch?v=C-WrnfUm33k)

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

- [kxxt](https://github.com/kxxt): fix(gatsby-core-utils): Use `grep -E` instead of `egrep` [PR #36648](https://github.com/gatsbyjs/gatsby/pull/36648)
- [Osiris8](https://github.com/Osiris8): chore(docs): Fix `Seo` imports in tutorial [PR #36587](https://github.com/gatsbyjs/gatsby/pull/36587)
- [evanwinter](https://github.com/evanwinter): chore(docs): Update "Layout components" related links [PR #36572](https://github.com/gatsbyjs/gatsby/pull/36572)
- [chrisj-skinner](https://github.com/chrisj-skinner): chore(docs): Update storybook main.js docs [PR #36627](https://github.com/gatsbyjs/gatsby/pull/36627)
- [alesma](https://github.com/alesma): chore(gatsby-plugin-sitemap): Add info about `page` object to README [PR #36582](https://github.com/gatsbyjs/gatsby/pull/36582)
- [benomatis](https://github.com/benomatis): fix(docs): tiny grammatical correction [PR #36630](https://github.com/gatsbyjs/gatsby/pull/36630)
- [Auspicus](https://github.com/Auspicus): feat(gatsby): Enable source maps when compiling Gatsby files in development [PR #36450](https://github.com/gatsbyjs/gatsby/pull/36450)
- [kvnang](https://github.com/kvnang): chore(docs): Fix Partytown forward events examples [PR #36613](https://github.com/gatsbyjs/gatsby/pull/36613)
- [karlhorky](https://github.com/karlhorky): feat(gatsby-remark-copy-linked-files): Add `absolutePath` to dir function [PR #36213](https://github.com/gatsbyjs/gatsby/pull/36213)
- [openscript](https://github.com/openscript): chore(gatsby): Add `loadPageDataSync` property to `onRenderBody` TS type [PR #36492](https://github.com/gatsbyjs/gatsby/pull/36492)
- [ebuildy](https://github.com/ebuildy): fix(gatsby-parcel-config): Adjust dependencies [PR #36583](https://github.com/gatsbyjs/gatsby/pull/36583)
- [AndrPetrov](https://github.com/AndrPetrov): fix(gatsby-link): Correct handling of trailingSlash & pathPrefix [PR #36542](https://github.com/gatsbyjs/gatsby/pull/36542)
- [treboryx](https://github.com/treboryx): fix(gatsby): Pass hostname to detect-port [PR #36496](https://github.com/gatsbyjs/gatsby/pull/36496)
- [colbywhite](https://github.com/colbywhite): chore(docs): Swap mobile url for regular url [PR #36618](https://github.com/gatsbyjs/gatsby/pull/36618)
- [MarcusCole518](https://github.com/MarcusCole518): chore(docs): Add "Payments Managing" & "Deploying to Fastly" [PR #36546](https://github.com/gatsbyjs/gatsby/pull/36546)
- [SilencerWeb](https://github.com/SilencerWeb): chore(gatsby-source-wordpress): Fix license link [PR #36621](https://github.com/gatsbyjs/gatsby/pull/36621)

[full-changelog]: https://github.com/gatsbyjs/gatsby/compare/gatsby@4.24.0-next.0...gatsby@4.24.0
