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

- [Slices API](#slices-api) - TODO
- [Partial Hydration (Beta)](#partial-hydration-beta) - TODO
- [GraphiQL v2](#graphiql-v2) - TODO

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

## Slices API

TODO

## Partial Hydration (Beta)

TODO

## GraphiQL v2

GraphiQL is Gatsby's integrated GraphQL development environment (IDE). It’s a powerful (and all-around awesome) tool you’ll use often while building Gatsby websites. We've updated [GraphiQL](https://github.com/graphql/graphiql/tree/main/packages/graphiql) from v1 to v2 to bring you these cool new features:

- Dark Mode
- Tabs
- Persisted State/Tabs using `localStorage`
- Better documentation explorer through search and markdown support

Want to learn more? Head to the [Introducing GraphiQL docs](/docs/how-to/querying-data/running-queries-with-graphiql/).

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
