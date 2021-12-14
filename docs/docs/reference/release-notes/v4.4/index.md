---
date: "2021-12-14"
version: "4.4.0"
title: "v4.4 Release Notes"
---

Welcome to `gatsby@4.4.0` release (December 2021 #1)

Key highlights of this release:

- [Detect Node Mutations](#detect-node-mutations) - Opt-in Diagnostic Mode

Also check out [notable bugfixes](#notable-bugfixes--improvements).

**Bleeding Edge:** Want to try new features as soon as possible? Install `gatsby@next` and let us know
if you have any [issues](https://github.com/gatsbyjs/gatsby/issues).

[Previous release notes](/docs/reference/release-notes/v4.3)

[Full changelog](https://github.com/gatsbyjs/gatsby/compare/gatsby@4.4.0-next.0...gatsby@4.4.0)

---

## Detect Node Mutations

In Gatsby 4 [LMDB](http://www.lmdb.tech/doc/) became the default data store. It allows Gatsby to execute data layer related processing outside of the main build process and enables Gatsby to run queries in multiple processes as well as support additional rendering strategies ([DSG](/docs/reference/rendering-options/deferred-static-generation/) and [SSR](/docs/reference/rendering-options/server-side-rendering/)).

In a lot of cases that change is completely invisible to users, but if you're a source plugin author or have your own custom source plugin you might be affected by this.

Direct node mutations in various API lifecycles are not persisted anymore. In previous Gatsby versions it did work because source of truth for the data layer was directly in Node.js memory, so mutating node was in fact mutating source of truth. Common errors when doing swap to `LMDB` will be that some fields don't exist anymore or are `null`/`undefined` when trying to execute GraphQL queries.

With this release you're now able to detect node mutations and debug the aforementioned cases of `null`/`undefined`. Learn more about this at [Debugging Missing or Stale Data Fields on Nodes](/docs/how-to/local-development/debugging-missing-data/).

## Notable bugfixes & improvements

- A lot of internal dependency updates to each package. You can check the `CHANGELOG.md` file in each package’s folder for the details
- `gatsby-plugin-emotion`: Use correct babel preset with `jsxRuntime` option (`gatsby-config.js`), via [PR #34085](https://github.com/gatsbyjs/gatsby/pull/34085)
- `gatsby`: Allow external systems to setup tracing for builds, via [PR #34204](https://github.com/gatsbyjs/gatsby/pull/34204)
- `gatsby-source-filesystem`: Ensure that the `fastq` `concurrency` parameter is of the correct type, via [PR #34186](https://github.com/gatsbyjs/gatsby/pull/34186)
- `gatsby-plugin-manifest`: Consider path prefix when getting localized manifest, via [PR #34174](https://github.com/gatsbyjs/gatsby/pull/34174)
- `gatsby-cli`: Fix for `--inspect-brk`, via [PR #34242](https://github.com/gatsbyjs/gatsby/pull/34242)

## Contributors

A big **Thank You** to [our community who contributed](https://github.com/gatsbyjs/gatsby/compare/gatsby@4.4.0-next.0...gatsby@4.4.0) to this release 💜

- [sidharthachatterjee](https://github.com/sidharthachatterjee): fix(gatsby): Add back an activity for jobs [PR #34061](https://github.com/gatsbyjs/gatsby/pull/34061)
- [pacahon](https://github.com/pacahon): fix(gatsby-source-filesystem): Ensure fastq concurrency parameter of the correct type [PR #34186](https://github.com/gatsbyjs/gatsby/pull/34186)
- [ashhitch](https://github.com/ashhitch)
  - Add missing Comma to Plugin Options page [PR #34208](https://github.com/gatsbyjs/gatsby/pull/34208)
  - chore(docs): Add missing comma to code example [PR #34222](https://github.com/gatsbyjs/gatsby/pull/34222)
- [iChenLei](https://github.com/iChenLei): feat(gatsby-plugin-emotion): Use correct babel preset with `jsxRuntime` [PR #34085](https://github.com/gatsbyjs/gatsby/pull/34085)
