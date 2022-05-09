---
date: "2022-05-10"
version: "4.14.0"
title: "v4.14 Release Notes"
---

Welcome to `gatsby@4.14.0` release (May 2022 #1)

Key highlights of this release:

- [Experimental: GraphQL Typgen](#experimental-graphql-typegen)
- [Updated Default Starter](#updated-default-starter)
- [Gatsby Functions Configuration](#gatsby-functions-configuration)
- [`gatsby-source-drupal`: Image CDN Support](#gatsby-source-drupal-image-cdn-support)
- [50% Improvement in image and font load time](#50-improvement-in-image-and-font-load-time)

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

## Updated Default Starter

We updated our [default Starter template `gatsby-starter-default`](https://www.gatsbyjs.com/starters/gatsbyjs/gatsby-starter-default/) to contain references to documentation, tutorial, our monorepo examples folder, and more – and aligned its look-and-feel to that of our `gatsby new`/`npm init gatsby` experience. It shows you how to use TypeScript, Server Side Rendering, and Deferred Static Generation in your Gatsby application.

![Preview of the new landing page. At the top it says "Welcome to Gatsby", below that it links to the separate subpages like "TypeScript" or "Server Side Rendering". Then four blocks linking out to sections like the tutorial or examples are shown. The footer contains links to Discord, Documentation, and more.](https://user-images.githubusercontent.com/16143594/167383192-e33e7b23-fa70-4a3f-8238-97f6273cecdc.png)

## 50% Improvement in Image and Font load time
When users visit a website, they need to see things on the screen before they begin interacting with the webpage. Prioritizing scripts over critical assest doesn't help us achieve this. Generally, we can lazily load other not essential scripts and allow images and font to load early enough.

Before now, gatsby preloads a huge percentage of Js & Json assets which may lead to [Network Congestion](https://en.wikipedia.org/wiki/Network_congestion) especially for large sites that end up with a lot of chunks. This prevents images and fonts from loading early in time. In this release, we stopped preloading Js & Json assests,  giving way to images and fonts to load on time.

The waterfall diagrams below describe what how we fetched assets before now and what it currently loooks like. 

### Before
![Gatsby asset waterfall before](https://www.webpagetest.org/waterfall.php?test=220508_BiDcFP_3BM&run=4&cached=&step=1)

### After
![Gatsby asset waterfall after](https://www.webpagetest.org/waterfall.php?test=220509_BiDcPV_A4X&run=2&cached=&step=1)

We ran a test on gatsbyjs.com to see what differnce this change makes. Here's a GiF to show the page loading process. 



![loaded image earlier](https://www.webpagetest.org/video/video.php?tests=220509_BiDcPV_A4X-l:Now-r:3,220508_BiDcFP_3BM-l:Before-r:4&bg=ffffff&text=222222&end=visual&format=gif)

With the branch new version, we finish loading and rendering the page and rendering at `1.2s` compared `2.2s` on in the previous version. Cummulatively this leads to more than 50% Improvement for users. 

## Gatsby Functions Configuration

TODO

## `gatsby-source-drupal`: Image CDN Support

Drupal now has Image CDN support. Enable it in your site by following the official [`gatsby-source-drupal` docs](https://www.gatsbyjs.com/plugins/gatsby-source-drupal/#gatsby-image-cdn).

## Image CDN

With Gatsby's new Image CDN feature we added a new GraphQL field `gatsbyImage` in a recent previous release. This field is used in place of `gatsbyImageData` an so the `getImage` helper was updated to look for this new field via [PR #35507](https://github.com/gatsbyjs/gatsby/pull/35507)

## Notable bugfixes & improvements

- `gatsby-source-contentful`:
  - Add support for tables in Rich Text, via [PR #33870](https://github.com/gatsbyjs/gatsby/pull/33870)
  - Add `contentTypeFilter` option, via [PR #35204](https://github.com/gatsbyjs/gatsby/pull/35204)
- `gatsby`: Fixes `UNHANDLED EXCEPTION write EPIPE` on Netlify, via [PR #35513](https://github.com/gatsbyjs/gatsby/pull/35513)
- `gatsby-plugin-image`: Fix image flicker issues between page navigations and/or state updates, via [PR #35226](https://github.com/gatsbyjs/gatsby/pull/35226)
- `gatsby-source-wordpress`:
  - Always include Draft slugs for Gatsby Preview via [PR #35573](https://github.com/gatsbyjs/gatsby/pull/35573).
  - Use Image CDN for non-transformable images in html fields via [PR #35529](https://github.com/gatsbyjs/gatsby/pull/35529)
  - Prevent GraphQL errors when a union list item is `null` via [PR #35533](https://github.com/gatsbyjs/gatsby/pull/35533/files)

## Contributors

A big **Thank You** to [our community who contributed][full-changelog] to this release 💜

TODO

[full-changelog]: https://github.com/gatsbyjs/gatsby/compare/gatsby@4.14.0-next.0...gatsby@4.14.0
