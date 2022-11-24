---
date: "2022-03-15"
version: "4.10.0"
title: "v4.10 Release Notes"
---

Welcome to `gatsby@4.10.0` release (March 2022 #2)

Key highlights of this release:

- [Image CDN](#image-cdn)

Also check out [notable bugfixes](#notable-bugfixes--improvements).

**Bleeding Edge:** Want to try new features as soon as possible? Install `gatsby@next` and let us know
if you have any [issues](https://github.com/gatsbyjs/gatsby/issues).

[Previous release notes](/docs/reference/release-notes/v4.9)

[Full changelog][full-changelog]

---

## Image CDN

Free your site from slow images forever. With the new Image CDN, we've added better support for remote files and images when building source plugins. The source plugins for WordPress & Contentful are already using the new `RemoteFile` GraphQL interface to enable the new `GatsbyImage` resolver (so you can try it out today). Other popular CMS and support for local files will follow. The new `GatsbyImage` resolver downloads images on demand and processes them during the build. This results in reduced build times and better user experience. You can even remove image processing as a whole during the build step! With Image CDN on Gatsby Cloud, we defer all image processing at the edge, getting even faster builds!

If you have feedback, please post it to the [umbrella discussion](https://github.com/gatsbyjs/gatsby/discussions/35147). Thanks!

If you're a source plugin author or written your custom source plugin, check out the [enabling Image CDN support guide](/docs/how-to/plugins-and-themes/creating-a-source-plugin/#enabling-image-cdn-support). You can also read the announcement blogpost [Image CDN: Lightning Fast Image Processing for Gatsby Cloud](/blog/image-cdn-lightning-fast-image-processing-for-gatsby-cloud/) to learn more.

Here's how you can use it in your queries:

```graphql
query {
  speakerPage {
    socialImage {
      gatsbyImage(layout: FIXED, width: 440)
    }
    image {
      gatsbyImage(layout: CONSTRAINED, width: 280, height: 280)
    }
  }
}
```

So `gatsbyImage` replaces `gatsbyImageData` that you know from `gatsby-plugin-image` already. Feature parity for its arguments is not 100%, but the most common operations behave the same. Read [How to enable Image CDN](https://support.gatsbyjs.com/hc/en-us/articles/4426393233171) to start using Image CDN today.

Once Image CDN is enabled, images will be served from a relative URL similar to this:

```
/_gatsby/image/<base64-string>/<base64-string>/<original-file-name>.<file-extension>
```

## Notable bugfixes & improvements

- `gatsby`
  - Fix handling of encoded query params, via [PR #34816](https://github.com/gatsbyjs/gatsby/pull/34816)
  - Fix incorrect "inconsistent node counters" errors, via [PR #35025](https://github.com/gatsbyjs/gatsby/pull/35025)
  - Use `gatsby-config.ts` file when creating new Gatsby project with TypeScript, via [PR #35128](https://github.com/gatsbyjs/gatsby/pull/35128)
  - Don't write out page-data file if query rerun but result didn't change, via [PR #34925](https://github.com/gatsbyjs/gatsby/pull/34925)
- `gatsby-plugin-sharp`
  - Fix `MaxListenersExceededWarning` messages, via [PR #35009](https://github.com/gatsbyjs/gatsby/pull/35009)
  - Fix generating multiple similar images with different `duotone` settings, via [PR #35075](https://github.com/gatsbyjs/gatsby/pull/35075)

## Contributors

A big **Thank You** to [our community who contributed][full-changelog] to this release 💜

- [njbmartin](https://github.com/njbmartin): chore(docs): typo in typescript documentation [PR #35040](https://github.com/gatsbyjs/gatsby/pull/35040)
- [baranbbr](https://github.com/baranbbr): chore(docs): Conditionally sourcing files using environment variables [PR #35056](https://github.com/gatsbyjs/gatsby/pull/35056)
- [hasthamalp](https://github.com/hasthamalp): chore(docs): Update query-execution.md [PR #35115](https://github.com/gatsbyjs/gatsby/pull/35115)
- [tcoopman](https://github.com/tcoopman): fix(gatsby): null check for context [PR #35096](https://github.com/gatsbyjs/gatsby/pull/35096)
- [Dusch4593](https://github.com/Dusch4593): chore(docs): Revising scope of `wrapPageElement()` and `wrapRootElement()` [PR #35057](https://github.com/gatsbyjs/gatsby/pull/35057)
- [mckelveygreg](https://github.com/mckelveygreg): chore(gatsby): add generic to GatsbyFunctionRequest [PR #35029](https://github.com/gatsbyjs/gatsby/pull/35029)
- [benackles](https://github.com/benackles): chore(docs): Fix broken link [PR #35071](https://github.com/gatsbyjs/gatsby/pull/35071)
- [tianheg](https://github.com/tianheg): chore(docs): Fix link to TS doc in tutorial [PR #35014](https://github.com/gatsbyjs/gatsby/pull/35014)
- [reviewher](https://github.com/reviewher): fix(gatsby-transformer-excel): Use `readFile` Buffer [PR #35050](https://github.com/gatsbyjs/gatsby/pull/35050)
- [jonohewitt](https://github.com/jonohewitt): fix(gatsby-plugin-sharp): Upgrade `probe-image-size` to fix memory leak warning [PR #35009](https://github.com/gatsbyjs/gatsby/pull/35009)
- [cheru-dev](https://github.com/cheru-dev): chore(docs): Fix typos [PR #35119](https://github.com/gatsbyjs/gatsby/pull/35119)
- [josephjosedev](https://github.com/josephjosedev)
  - chore(docs): Update query-extraction link to relay [PR #35045](https://github.com/gatsbyjs/gatsby/pull/35045)
  - chore(docs): Update query-extraction.md to point to TS file instead of old JS [PR #35067](https://github.com/gatsbyjs/gatsby/pull/35067)
  - docs(gatsby): Update `query-watcher` to reference TS file [PR #35100](https://github.com/gatsbyjs/gatsby/pull/35100)
- [keevan](https://github.com/keevan): docs(gh-pages): improve separate repository instructions [PR #35118](https://github.com/gatsbyjs/gatsby/pull/35118)
- [adambaratz](https://github.com/adambaratz): fix(gatsby): Misspelled cacheIdentifier key [PR #35070](https://github.com/gatsbyjs/gatsby/pull/35070)
- [natalyjazzviolin](https://github.com/natalyjazzviolin): chore(docs): Update migration guide to add more info about image resolvers [PR #35105](https://github.com/gatsbyjs/gatsby/pull/35105)

[full-changelog]: https://github.com/gatsbyjs/gatsby/compare/gatsby@4.10.0-next.0...gatsby@4.10.0
