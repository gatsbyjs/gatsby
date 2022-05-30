---
date: "2022-05-24"
version: "4.15.0"
title: "v4.15 Release Notes"
---

Welcome to `gatsby@4.15.0` release (May 2022 #2)

Key highlights of this release:

- [Script Component](#script-component)
- [GraphQL Typegen](#graphql-typegen)

Also check out [notable bugfixes](#notable-bugfixes--improvements).

**Bleeding Edge:** Want to try new features as soon as possible? Install `gatsby@next` and let us know if you have any [issues](https://github.com/gatsbyjs/gatsby/issues).

[Previous release notes](/docs/reference/release-notes/v4.14)

[Full changelog][full-changelog]

---

## Script Component

We're releasing a built-in `<Script>` component that aids in loading third-party scripts performantly.

As a familiar React component, migration to the `<Script>` component is as simple as importing and capitalizing your existing script tags in most cases:

```diff
import { Script } from "gatsby";

-<script src="https://my-example-script" />
+<Script src="https://my-example-script" />
```

This will load your script after your page has hydrated by default, offering performance benefits over the native `<script>` tag (even with `async` or `defer` applied).

In our testing so far, we've noted a **20% reduction in Total Blocking Time** for Gatsbyjs.com by moving 3 third party scripts to use the `off-main-thread` strategy via the new component. With the benefit of gradually migrating scripts to the new component, we'll be able to continue to fine tune scripts to the appropriate strategies, and provide the very best frontend speed to visitors of Gatsbyjs.com.

The Gatsby `<Script>` component includes three loading strategies that you can define, allowing a great deal of flexibility via a single `strategy` attribute:

- `post-hydrate` - Loads after the page has hydrated
- `idle` - Loads after the page has become idle
- `off-main-thread` (experimental) - Loads off the main thread in a web worker via [Partytown](https://partytown.builder.io)

In addition, these features are supported out of the box:

- Inline scripts via template literals and the `dangerouslySetInnerHTML` property
- `onLoad` and `onError` callbacks for `post-hydrate` and `idle` scripts with sources

For full details, see the [Gatsby Script reference documentation](/docs/reference/built-in-components/gatsby-script/).

> Note - If you are using Jest, you will need to include `gatsby-script` in your `transformIgnorePatterns` key in your Jest config since `gatsby-script` is an ES module. See [the unit testing documentation on Jest configuration](/docs/how-to/testing/unit-testing/#2-creating-a-configuration-file-for-jest) for more details.

## GraphQL Typegen

In the last [v4.14 release](/docs/reference/release-notes/v4.14/#experimental-graphql-typegen) we've added GraphQL Typegen as an experimental feature. After some bugfixing and improving its documentation the feature is now generally available behind a `gatsby-config` option.

```js:title=gatsby-config.js
module.exports = {
  graphqlTypegen: true,
}
```

Read the [GraphQL Typegen guide](/docs/how-to/local-development/graphql-typegen) to learn how you can use it today and continue to give us your feedback in the [RFC discussion](https://github.com/gatsbyjs/gatsby/discussions/35420).

## Notable bugfixes & improvements

- `gatsby`:
  - Improved performance of "Building development bundle", via [PR #35641](https://github.com/gatsbyjs/gatsby/pull/35641)
  - Don't apply trailing slashes to ".pdf" or ".xml" links, via [PR #35681](https://github.com/gatsbyjs/gatsby/pull/35681)
- `gatsby-cli`: Default to `production` NODE_ENV for `gatsby serve` to be consistent with `gatsby build`, via [PR #35693](https://github.com/gatsbyjs/gatsby/pull/35693)
- `gatsby-source-wordpress`: handle media edit (for example rotation or rename) properly for IMAGE_CDN, via [PR #35687](https://github.com/gatsbyjs/gatsby/pull/35687)
- `gatsby-source-drupal`:
  - Warn about corrupt files and don't create enable IMAGE_CDN if `skipFileDownloads` is not enabled, via [PR #35619](https://github.com/gatsbyjs/gatsby/pull/35619)
  - Add missing `placeholderStyleName` plugin config option, via [PR #35644](https://github.com/gatsbyjs/gatsby/pull/35644)

## Contributors

A big **Thank You** to [our community who contributed][full-changelog] to this release 💜

- [chuckreynolds](https://github.com/chuckreynolds): sitemap plugin readme has incorrect array name reference [PR #35659](https://github.com/gatsbyjs/gatsby/pull/35659)
- [admir4l](https://github.com/admir4l): chore(gatsby, gatsby-cli, gatsby-plugin-sharp): remove old unused UUID dependency [PR #35657](https://github.com/gatsbyjs/gatsby/pull/35657)
- [feedm3](https://github.com/feedm3): fix(gatsby): use correct types for the response headers [PR #35633](https://github.com/gatsbyjs/gatsby/pull/35633)
- [alvis](https://github.com/alvis): fix(gatsby): correct the types of `createNode` action return [PR #32522](https://github.com/gatsbyjs/gatsby/pull/32522)

[full-changelog]: https://github.com/gatsbyjs/gatsby/compare/gatsby@4.15.0-next.0...gatsby@4.15.0
