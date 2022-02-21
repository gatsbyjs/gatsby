---
title: Scaling Issues
---

In certain circumstances, your application may hit some scaling issues that necessitate workarounds. These workarounds should be treated as _temporary_ and should be revisited in the future as Gatsby scales to support larger applications with hundreds of thousands of pages.

However -- until we get to that point, some workarounds are useful to consider if they unblock your team from deploying, developing, etc.

> Just looking for possible solutions? [Jump ahead](#possible-solutions-to-scaling-issues)

## What is a scaling issue?

A scaling issue is evident if your application is unable to build due to an error _or_ if it is extremely slow in some lifecycle, e.g. `develop` or `build`. For example:

- An "Out of Memory" occurs when building in CI
- The `develop` lifecycle takes 10x as long as `build`

and more. An example of a scaling error thrown to the console may look something like:

```shell
success open and validate gatsby-configs — 0.005 s
success load plugins — 0.131 s
success onPreInit — 0.283 s
success initialize cache — 0.026 s
success copy gatsby files — 0.071 s
success onPreBootstrap — 0.009 s
success source and transform nodes — 5.291 s
success building schema — 0.623 s
success createPages — 0.608 s
success createPagesStatefully — 0.025 s
success onPreExtractQueries — 0.000 s
success update schema — 0.478 s
success extract queries from components — 0.127 s
⠄ run graphql queries — 310/728 2.51 queries/second
<--- Last few GCs --->

[10208:0000029380BC1810]   139036 ms: Scavenge 1374.2 (1423.1) -> 1373.3 (1424.1) MB, 2.2 / 0.0 ms  (average mu = 0.317, current mu = 0.262) allocation failure
[10208:0000029380BC1810]   139039 ms: Scavenge 1374.3 (1424.1) -> 1373.5 (1424.6) MB, 2.0 / 0.0 ms  (average mu = 0.317, current mu = 0.262) allocation failure
[10208:0000029380BC1810]   139043 ms: Scavenge 1374.4 (1424.6) -> 1373.6 (1425.1) MB, 2.1 / 0.0 ms  (average mu = 0.317, current mu = 0.262) allocation failure
```

## When can a scaling issue arise?

A scaling issue _can_ arise in varied cases, but typically something like:

- A Gatsby application with ~100K+ pages
  - See [this issue](https://github.com/gatsbyjs/gatsby/issues/12343) for an example
- Extremely large `json` files sourced with `gatsby-transformer-json`
- Extremely large GraphQL queries, which are stored in memory in the `develop` lifecycle
  - See [this issue](https://github.com/gatsbyjs/gatsby/issues/12566) for an example

If you are seeing errors or slowness **and** your Gatsby app matches one of the above use-cases, it's very likely you are hitting some scaling issues.

## Possible solutions to scaling issues

It's difficult to pin down exactly _how_ to fix a scaling issue. We have some recommendations and workarounds that _may_ work for your application.

Note: the application of these techniques should be considered analogous to applying a bandage. A bandage solves the underlying issue, but at some indeterminate point in the future the underlying issue may be healed! In much the same way--treat these techniques as temporary and re-visit in the future if underlying scaling issues in Gatsby have since been resolved.

### Switch off type inference for `SitePage.context`

When using the `createPages` API to pass large amounts of data to pages via `context` (which is generally [not recommended](/docs/creating-and-modifying-pages#performance-implications)), Gatsby's type inference can become slow. In most cases, it is not actually necessary to include the `SitePage.context` field in the GraphQL schema, so switching off type inference for the `SitePage` type should be safe:

```js
// gatsby-node.js
exports.createSchemaCustomization = ({ actions }) => {
  actions.createTypes(`
    type SitePage implements Node @dontInfer {
      path: String!
    }
  `)
}
```
