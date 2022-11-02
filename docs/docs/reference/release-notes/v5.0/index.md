---
date: "2022-11-08"
version: "5.0.0"
title: "v5 Release Notes"
---

Welcome to `gatsby@5.0.0` release (November 2022 #1).

Gatsby 5 introduces the Slices API and Partial Hydration (Beta). Slices unlock up to 90% reduction in build duration for content changes in highly shared components, Partial Hydration allows you to ship only the necessary JavaScript to the browser.
We’ve tried to make migration smooth. Please refer to the [migration guide](/docs/reference/release-notes/migrating-from-v4-to-v5/)
and [let us know](https://github.com/gatsbyjs/gatsby/issues/new/choose) if you encounter any issues when migrating.

Key highlights of this release:

- [Slices API](#slices-api) - Only re-build individual slices of your page
- [Partial Hydration (Beta)](#partial-hydration-beta) - Improve frontend performance by shipping less JavaScript
- [GraphiQL v2](#graphiql-v2) - An all new UI with features like dark mode, tabs, and persisted state

Major dependency updates:

- [Node 18](#node-18)
- [React 18](#react-18)

**Bleeding Edge:** Want to try new features as soon as possible? Install `gatsby@next` and let us know
if you have any [issues](https://github.com/gatsbyjs/gatsby/issues).

[Full changelog][full-changelog]

## Breaking Changes

If you're looking for an overview of all breaking changes and how to migrate, please see the [migrating from v4 to v5 guide](/docs/reference/release-notes/migrating-from-v4-to-v5/).

## Overview Video

Prefer video over text? No problem! Learn more about all the new features of Gatsby 5 in the video below:

TODO

## Slice API

The Slice API allows you to define highly-shared components in your site, which will then inform Gatsby to build those shared components only once. After the files are built, Gatsby will then stitch the resulting markup and JavaScript to the pages that include that shared component. This means that changes to highly-shared components (such as headers, footers, and common layouts) no longer require a rebuild of all pages that use that shared component.

The Slice API introduces two critical pieces, the [`createSlice`](/docs/reference/config-files/actions/#createSlice) action from the [`createPages`](/docs/reference/config-files/gatsby-node/#createPages) API and the `<Slice>` placeholder. To create a Slice, you must first call `createSlice` within `gatsby-node.js`:

```js:title=gatsby-node.js
exports.createPages = async ({ actions }) => {
  actions.createSlice({
    id: `header`,
    component: require.resolve(`./src/components/header.js`),
  })
}
```

Then, use the `<Slice>` placeholder where the `<Header>` component was previously:

```js:title=src/components/layout.js
import { Slice } from "gatsby"
import { Footer } from "./footer"

export const DefaultLayout = ({ children, headerClassName }) => {
  return (
    <div className={styles.defaultLayout} />
      <Slice alias="header" className={headerClassName} />
      {content}
      <Footer />
    </div>
  )
}
```

Now, when a code update or data update is made for the `<Header>` component, only the HTML for the Slice will be updated, and later stitched into the pre-existing HTML for the pages that use it.

While building the Slice API, we wanted to make sure it was worthwhile for all Gatsby sites. To validate the improvements of the Slice API, we created a 10,000 page Contentful site with a shared header. We then issued both code updates to the git repository as well as data updates to Contentful. Here are the results:

|                                             | Code Update | Data Update |
| ------------------------------------------- | ----------- | ----------- |
| No Slices (Self-Hosted)                     | 1253s       | 1276s       |
| With Slices (Self-Hosted)                   | 1011s       | 958s        |
| No Slices on Gatsby Cloud                   | 155s        | 22s         |
| With Slices on Gatsby Cloud                 | 129s        | 15s         |
| With Slices on Gatsby Cloud + Optimizations | 34s         | 10s         |

Across the board we can see at least a 20% decrease in build time when using Slices. When using the [Slices Optimization](/docs/how-to/cloud/slices-optimization/) on Gatsby Cloud, build time decreases by 78% compared to No Slices on Gatsby Cloud. As the site grows, the benefit of the Gatsby Slice API will only increase.

For more information, read the [Using Slices How-To Guide](/docs/how-to/performance/using-slices/) or the [Slice API Reference Documentation](/docs/reference/built-in-components/gatsby-slice).

## Partial Hydration (Beta)

Partial Hydration enables you to selectively add interactivity to your otherwise completly static app. This results in improved frontend performance while keeping the benefits of client-side apps. Gatsby uses [React server components](https://github.com/reactjs/rfcs/blob/main/text/0188-server-components.md) to achieve this.

Partial Hydration is in **Beta** and not enabled by default. You have to opt-in to try it out. Reason for this is that React server components are still quite new (and the ecosystem as a whole hasn't caught up, e.g. CSS-in-JS libraries) and that currently you are required to use an experimental version of `react`/`react-dom`. Therefore we don't recommend using Partial Hydration in production just yet. Once things have stabilized we'll announce the general availablity release of Partial Hydration and adjust the documentation.

Read the [Partial Hydration How-To Guide](/docs/how-to/performance/partial-hydration/) for detailed instructions. We also recommend reading the [Partial Hydration Conceptual Guide](/docs/conceptual/partial-hydration/) to understand why Gatsby chose React server components and how Partial Hydration works on a high-level.

As a quick start, here's how you can use Partial Hydration in Gatsby 5:

- Install experimental version of `react` and `react-dom`:
  ```shell
  npm install --save-exact react@experimental react-dom@experimental
  ```
- Enable the feature flag inside `gatsby-config`:
  ```js:title=gatsby-config.js
  module.exports = {
    flags: {
      PARTIAL_HYDRATION: true
    }
  }
  ```
- Add the `"use client"` directive to any component that needs to be a client component. You can see an example in the [gatsby-partial-hydration-starter](https://github.com/gatsbyjs/gatsby-partial-hydration-starter/blob/main/src/components/demo.js)

## GraphiQL v2

GraphiQL is Gatsby's integrated GraphQL development environment (IDE). It’s a powerful (and all-around awesome) tool you’ll use often while building Gatsby websites. We've updated [GraphiQL](https://github.com/graphql/graphiql/tree/main/packages/graphiql) from v1 to v2 to bring you these cool new features:

- Dark Mode
- Tabs
- Persisted State/Tabs using `localStorage`
- Better documentation explorer through search and markdown support
- Plugin ecosystem

Want to learn more? Head to the [Introducing GraphiQL docs](/docs/how-to/querying-data/running-queries-with-graphiql/).

The plugin ecosystem also will allow us to more easily add functionality to GraphiQL in the future. In preparation for this release we've created [`@graphiql/plugin-code-exporter`](https://github.com/graphql/graphiql/tree/main/packages/graphiql-plugin-code-exporter) for example.

Many thanks go to [acao](https://github.com/acao) and the [Stellate team](https://stellate.co/) for shipping GraphiQL v2! More props [in this tweet thread](https://twitter.com/GraphiQL/status/1563057905984995328).

## Node 18

We are dropping support for Node 14 and 16 as our currently supported Node 14 version will reach EOL during the Gatsby 5 lifecycle. Since the timing of the "Active LTS" status of Node 18 is nearly the same as Gatsby 5 we're jumping directly to Node 18. See the main changes in [Node 18 release notes](https://nodejs.org/en/blog/release/v18.0.0/).

Check [Node’s releases document](https://github.com/nodejs/Release#nodejs-release-working-group) for version statuses.

## React 18

We are dropping official support for React 16 and 17. The new minimal required version is React 18. This is a requirement for the Partial Hydration feature.

## Highlights from v4

While we have your attention we want to showcase all the awesome features we shipped during the Gatsby 4 lifecycle. Give them a try!

- [Script Component](/docs/reference/built-in-components/gatsby-script/): Gatsby’s Script component offers a convenient way to declare different loading strategies, and a default loading strategy that gives Gatsby users strong performance out of the box.
- [Head API](/docs/reference/built-in-components/gatsby-head/): Gatsby includes a built-in `Head` export that allows you to add elements to the document head of your pages. Compared to react-helmet or other similar solutions, Gatsby Head is easier to use, more performant, has a smaller bundle size, and supports the latest React features.
- [MDX v2](/plugins/gatsby-plugin-mdx/): `gatsby-plugin-mdx` was updated to support MDX v2. All of the speed, bundle size, and syntax improvements for MDX v2 can be taken advantage of in Gatsby.
- [TypeScript](/docs/how-to/custom-configuration/typescript/) & [GraphQL Typegen](/docs/how-to/local-development/graphql-typegen/): You can write your `gatsby-config` and `gatsby-node` in TypeScript now. Together with GraphQL Typegen which automatically generates TypeScript types for your GraphQL queries you can author all your Gatsby code in TypeScript.
- [Image CDN](/blog/image-cdn-lightning-fast-image-processing-for-gatsby-cloud/): Images are typically the largest files on a site and delay page load significantly while they are pulled over the network. With Image CDN, image processing can be done outside of your builds so you can ship your content even faster.

## Contributors

A big **Thank You** to [our community who contributed][full-changelog] to this release 💜

TODO

[full-changelog]: https://github.com/gatsbyjs/gatsby/compare/gatsby@4.24.0-next.0...gatsby@5.0.0
