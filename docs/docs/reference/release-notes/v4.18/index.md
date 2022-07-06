---
date: "2022-07-05"
version: "4.18.0"
title: "v4.18 Release Notes"
---

Welcome to `gatsby@4.18.0` release (July 2022 #1)

Key highlights of this release:

- [`typesOutputPath` option for GraphQL Typegen](#typesoutputpath-option-for-graphql-typegen) - Configure the location of the generated TypeScript types
- [Server Side Rendering (SSR) in development](#server-side-rendering-ssr-in-development) - Find bugs & hydration errors more easily during `gatsby develop`
- [Open RFCs](#open-rfcs) - MDX v2 & Metadata management

Also check out [notable bugfixes](#notable-bugfixes--improvements).

**Bleeding Edge:** Want to try new features as soon as possible? Install `gatsby@next` and let us know if you have any [issues](https://github.com/gatsbyjs/gatsby/issues).

[Previous release notes](/docs/reference/release-notes/v4.17)

[Full changelog][full-changelog]

---

## `typesOutputPath` option for GraphQL Typegen

We saw great adoption of the GraphQL Typegen feature we've added in the [4.15 Release](/docs/reference/release-notes/v4.15/#graphql-typegen). We've heard that the location of the automatically generated TypeScript definitions file should be configurable. By default, it's generated in the `src/gatsby-types.d.ts` location.

You're now able to specify the location of the generated types using the `typesOutputPath` option. The `graphqlTypegen` option accepts both a boolean and an object now. If you don't pass an object (but `graphqlTypegen: true`), the default value for each option will be used.

```javascript:title=gatsby-config.js
module.exports = {
  graphqlTypegen: {
    typesOutputPath: `gatsby-types.d.ts`,
  },
}
```

The path is relative to the site root, in the example above the file would be generated at `<root>/gatsby-types.d.ts`. For more details and any future options, see the [Gatsby Config API](/docs/reference/config-files/gatsby-config/#graphqltypegen).

## Server Side Rendering (SSR) in development

Shortly before v4 release, we disabled [DEV_SSR flag](https://github.com/gatsbyjs/gatsby/discussions/28138) because `getServerData` was not properly handled. In this release, we handled `getServerData` properly and restored the flag. Now you can add the `DEV_SSR` flag to your `gatsby-config` file so you can spot and fix SSR errors (like trying to access the window object) during development.

## Open RFCs

We continue to have ongoing RFCs that we’d like your input on. Please give it a read, if applicable a try, and leave feedback!

- [Support for MDX v2](https://github.com/gatsbyjs/gatsby/discussions/25068): We are updating `gatsby-plugin-mdx` to be compatible with MDX v2. Keep a look out in the discussion for a canary to try!
- [Metadata Management API](https://github.com/gatsbyjs/gatsby/discussions/35841): We will be adding a built-in metadata management solution to Gatsby. Work is in progress and you can try out the canary now!

## Notable bugfixes & improvements

- `gatsby`
  - Add retry mechanism for `gatsby-node/config.ts` compilation to fix intermittent bug during `gatsby build`, via [PR #35974](https://github.com/gatsbyjs/gatsby/pull/35974)
  - Fix potentially wrong query results when querying fields with custom resolvers, via [PR #35369](https://github.com/gatsbyjs/gatsby/pull/35369)
- `gatsby-cli`: Set `NODE_ENV` earlier to fix Jest failing with `Couldn't find temp query result` error, via [PR #35968](https://github.com/gatsbyjs/gatsby/pull/35968)
- `gatsby-source-wordpress`: Always hydrate images and use the right parent element, via [PR #36002](https://github.com/gatsbyjs/gatsby/pull/36002)
- Properly compile all packages for Node and browser environment, via [PR #35948](https://github.com/gatsbyjs/gatsby/pull/35948)
- Use `babel-plugin-lodash` to reduce `lodash` size published packages, via [PR #35947](https://github.com/gatsbyjs/gatsby/pull/35947)

## Contributors

A big **Thank You** to [our community who contributed][full-changelog] to this release 💜

- [glitton](https://github.com/glitton): chore(docs): Remove trailing slashes section in creating-and-modifying-pages [PR #35843](https://github.com/gatsbyjs/gatsby/pull/35843)
- [rutterjt](https://github.com/rutterjt): chore(docs): fix query type name in Typegen guide [PR #35961](https://github.com/gatsbyjs/gatsby/pull/35961)
- [slaleye](https://github.com/slaleye): chore(docs): Update copy in tutorial part 1 [PR #35992](https://github.com/gatsbyjs/gatsby/pull/35992)
- [cameronbraid](https://github.com/cameronbraid): fix(gatsby): Partytown URI encoding of redirect parameters [PR #35990](https://github.com/gatsbyjs/gatsby/pull/35990)
- [axe312ger](https://github.com/axe312ger): chore(gatsby): Remove MDX `resolutions` [PR #36010](https://github.com/gatsbyjs/gatsby/pull/36010)

[full-changelog]: https://github.com/gatsbyjs/gatsby/compare/gatsby@4.18.0-next.0...gatsby@4.18.0
