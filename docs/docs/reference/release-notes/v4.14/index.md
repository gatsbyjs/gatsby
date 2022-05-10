---
date: "2022-05-10"
version: "4.14.0"
title: "v4.14 Release Notes"
---

Welcome to `gatsby@4.14.0` release (May 2022 #1)

Key highlights of this release:

- [Experimental: GraphQL Typgen](#experimental-graphql-typegen)
- [Improvements in Image and Font Loading Times](#improvements-in-image-and-font-loading-times)
- [Gatsby Functions Body Parsing Configuration](#gatsby-functions-body-parsing-configuration)
- [`gatsby-source-drupal`: Image CDN Support](#gatsby-source-drupal-image-cdn-support)
- [Updated Default Starter](#updated-default-starter)

Also check out [notable bugfixes](#notable-bugfixes--improvements).

**Bleeding Edge:** Want to try new features as soon as possible? Install `gatsby@next` and let us know if you have any [issues](https://github.com/gatsbyjs/gatsby/issues).

[Previous release notes](/docs/reference/release-notes/v4.13)

[Full changelog][full-changelog]

---

## Experimental: GraphQL Typegen

We're adding a built-in way for automatic TypeScript type generation and better GraphQL IntelliSense in Gatsby. If you've used [gatsby-plugin-typegen](https://github.com/cometkim/gatsby-plugin-typegen) or [gatsby-plugin-ts](https://github.com/d4rekanguok/gatsby-typescript/tree/master/packages/gatsby-plugin-ts) in the past you'll be familiar with this feature and we really value your feedback on this feature!

Here's a short video of what you'll be able to do:

<img
  alt="Short video of using the new GraphQL Typegen feature in Gatsby. A Queries.IndexPageQuery is added to the PageProps of the page, then the query is changed to add siteMetadata and its title. At the end this new key is used inside the page."
  src="https://user-images.githubusercontent.com/16143594/167390143-9188b688-a903-406a-ba01-2d4b69f32ccf.gif"
  loading="lazy"
/>

As noted already, this feature is still experimental and the API surface might change until the feature is in general availability. Please give us your feedback in the [RFC: GraphQL Typegen](https://github.com/gatsbyjs/gatsby/discussions/35420) discussion after you have tried it out.

### Trying it out

Make sure that you're on `gatsby@latest` or `gatsby@next`. Next, edit your `gatsby-config.js` to include a flag called `GRAPHQL_TYPEGEN`.

```js:title=gatsby-config.js
module.exports = {
  flags: {
    GRAPHQL_TYPEGEN: true,
  }
}
```

Then you can run `gatsby develop` and files will be created inside `.cache/typegen`. You can reference `.cache/typegen/graphql.config.json` inside a `graphql.config.js` at the root of your site to configure the GraphQL language server/VSCode extension.

Then inside your pages you can access the global namespace `Queries` to get your type information. Make sure that your queries have a name!

The project [graphql-typegen-testing](https://github.com/LekoArts/graphql-typegen-testing) shows all this if you want to get started quickly.

### Intellisense

The video shown above gives autocompletion for your queries. This is achieved by using VSCode, the [GraphQL Plugin](https://marketplace.visualstudio.com/items?itemName=GraphQL.vscode-graphql), and defining a `graphql.config.js` with the following contents:

```js:title=graphql.config.js
module.exports = require("./.cache/typegen/graphql.config.json")
```

We intend to document as many ways to use a GraphQL language server to benefits from this information, so we'd also love your input here.

## Improvements in Image and Font Loading Times

Previously, Gatsby preloaded a large amount of JavaScript and JSON assets which may lead to [Network Congestion](https://en.wikipedia.org/wiki/Network_congestion), especially for large sites with a lot of split chunks. This didn't allow images and fonts to load as early as possible.

With this release we changed Gatsby's behavior and now lazily load non-essential scripts and assets. You can see a before and after of two waterfall diagrams on gatsbyjs.com here:

- [Before Waterfall](https://user-images.githubusercontent.com/16143594/167626715-aa51688a-a38a-4cc2-bd2a-25332dce08af.png)
- [After Waterfall](https://user-images.githubusercontent.com/16143594/167626724-62635e1b-32c8-4c4b-a3bd-0b4184b05fb7.png)

In total this lead to a **50% improvement** in loading speed for gatsbyjs.com which you can see in this short video:

![Comparison of before and after this change on gatsbyjs.com. The left side shows "Now", the right one "Before". Both videos show how the hero section of gatsbyjs.com is loaded, below it a number showing the time in seconds is placed.](https://www.webpagetest.org/video/video.php?tests=220509_BiDcPV_A4X-l:Now-r:3,220508_BiDcFP_3BM-l:Before-r:4&bg=ffffff&text=222222&end=visual&format=gif)

The website finished loading after 1.2s compared 2.2s on previous Gatsby versions. This is achieved by using the improvements in Gatsby's core, `gatsby-plugin-gatsby-cloud`'s default settings, and [Gatsby Cloud](https://www.gatsbyjs.com/products/cloud/).

## Gatsby Functions Body Parsing Configuration

Gatsby now supports adjusting body parsing middleware for API functions. This allows users to increase request body size limit and/or support 3rd party webhook signature verification. For details and examples check [`Custom body parsing` documentation](/docs/reference/functions/middleware-and-helpers/#custom-body-parsing).

## `gatsby-source-drupal`: Image CDN Support

Drupal now has Image CDN support. Enable it in your site by following the official [`gatsby-source-drupal` documentation](/plugins/gatsby-source-drupal/#gatsby-image-cdn).

## Updated Default Starter

We updated our [default Starter template `gatsby-starter-default`](https://www.gatsbyjs.com/starters/gatsbyjs/gatsby-starter-default/) to contain references to documentation, tutorial, our monorepo examples folder, and more – and aligned its look-and-feel to that of our `gatsby new`/`npm init gatsby` experience. It shows you how to use TypeScript, Server Side Rendering, and Deferred Static Generation in your Gatsby application.

![Preview of the new landing page. At the top it says "Welcome to Gatsby", below that it links to the separate subpages like "TypeScript" or "Server Side Rendering". Then four blocks linking out to sections like the tutorial or examples are shown. The footer contains links to Discord, Documentation, and more.](https://user-images.githubusercontent.com/16143594/167383192-e33e7b23-fa70-4a3f-8238-97f6273cecdc.png)

## Notable bugfixes & improvements

- `gatsby-source-contentful`:
  - Add support for tables in Rich Text, via [PR #33870](https://github.com/gatsbyjs/gatsby/pull/33870)
  - Add `contentTypeFilter` option, via [PR #35204](https://github.com/gatsbyjs/gatsby/pull/35204)
- `gatsby`: Fixes `UNHANDLED EXCEPTION write EPIPE` on Netlify, via [PR #35513](https://github.com/gatsbyjs/gatsby/pull/35513)
- `gatsby-plugin-image`:
  - Fix image flicker issues between page navigations and/or state updates, via [PR #35226](https://github.com/gatsbyjs/gatsby/pull/35226)
  - The `getImage` helper function was updated to look for `gatsbyImage`, via [PR #35507](https://github.com/gatsbyjs/gatsby/pull/35507)
- `gatsby-source-wordpress`:
  - Always include Draft slugs for Gatsby Preview via [PR #35573](https://github.com/gatsbyjs/gatsby/pull/35573).
  - Use Image CDN for non-transformable images in html fields, via [PR #35529](https://github.com/gatsbyjs/gatsby/pull/35529)
  - Prevent GraphQL errors when a union list item is `null`, via [PR #35533](https://github.com/gatsbyjs/gatsby/pull/35533/files)

## Contributors

A big **Thank You** to [our community who contributed][full-changelog] to this release 💜

- [chrisq21](https://github.com/chrisq21): chore(gatsby): Expose `serverDataStatus` field in SSR type declaration file [PR #35505](https://github.com/gatsbyjs/gatsby/pull/35505)
- [rodet](https://github.com/rodet): chore(docs): Add note about optimizing GitHub publish [PR #35465](https://github.com/gatsbyjs/gatsby/pull/35465)
- [renbaoshuo](https://github.com/renbaoshuo): chore(docs): remove git.io urls [PR #35497](https://github.com/gatsbyjs/gatsby/pull/35497)
- [rburgst](https://github.com/rburgst): fix(gatsby-remark-images): support resolving markdown images from child nodes [PR #28093](https://github.com/gatsbyjs/gatsby/pull/28093)
- [orinokai](https://github.com/orinokai): fix(gatsby-plugin-preload-fonts): defer checking for write access [PR #35381](https://github.com/gatsbyjs/gatsby/pull/35381)
- [GaryPWhite](https://github.com/GaryPWhite): chore(gatsby): Bump `react-dev-utils` to v12 [PR #35468](https://github.com/gatsbyjs/gatsby/pull/35468)
- [axe312ger](https://github.com/axe312ger): feat(contentful): add support for tables in Rich Text [PR #33870](https://github.com/gatsbyjs/gatsby/pull/33870)
- [ascorbic](https://github.com/ascorbic): fix(gatsby): wait for worker jobs to complete [PR #35513](https://github.com/gatsbyjs/gatsby/pull/35513)
- [xavivars](https://github.com/xavivars)
  - fix(gatsby-source-contentful): Prevent null pointer exception [PR #35244](https://github.com/gatsbyjs/gatsby/pull/35244)
  - feat(gatsby-source-contentful): Add `contentTypeFilter` [PR #35204](https://github.com/gatsbyjs/gatsby/pull/35204)
- [me4502](https://github.com/me4502): perf(gatsby): Minify page-data [PR #35578](https://github.com/gatsbyjs/gatsby/pull/35578)

[full-changelog]: https://github.com/gatsbyjs/gatsby/compare/gatsby@4.14.0-next.0...gatsby@4.14.0
