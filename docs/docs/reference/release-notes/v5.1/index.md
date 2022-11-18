---
date: "2022-11-22"
version: "5.1.0"
title: "v5.1 Release Notes"
---

Welcome to `gatsby@5.1.0` release (November 2022 #2)

This is the first minor release after the recent major release of Gatsby 5! We are focused on your feedback and implementing fixes as needed.

If you haven't migrated yet, please refer to the [migration guide](/docs/reference/release-notes/migrating-from-v4-to-v5/). We've done our best to make the transition smooth!

Some brief notes about what Gatsby 5 brings to the table:

- [Slices API](https://www.gatsbyjs.com/docs/reference/built-in-components/gatsby-slice/) unlocks up to 90% reduction in build duration for content changes in highly shared components
- [Partial Hydration](https://www.gatsbyjs.com/docs/how-to/performance/partial-hydration/) allows you to ship only the necessary JavaScript to the browser

Also check out [notable bugfixes](#notable-bugfixes--improvements).

**Bleeding Edge:** Want to try new features as soon as possible? Install `gatsby@next` and let us know if you have any [issues](https://github.com/gatsbyjs/gatsby/issues).

[Previous release notes](/docs/reference/release-notes/v5.0)

[Full changelog][full-changelog]

---

## Notable bugfixes & improvements

- `gatsby`:
  - Fix writing of static query files when automatic sort and aggregation graphql codemod is run, via [PR #36997](https://github.com/gatsbyjs/gatsby/pull/36997)
  - Fix graphql@16 peer dependency problems by migrating from express-graphql to graphql-http, via [PR #37001](https://github.com/gatsbyjs/gatsby/pull/37001)
  - Use XState `predictableActionArguments` and upgrade to latest, via [PR #36342](https://github.com/gatsbyjs/gatsby/pull/36342)
- `gatsby-core-utils`:
  - Fix handling of non-ASCII characters in remote file download, via [PR #35637](https://github.com/gatsbyjs/gatsby/pull/35637)
- `gatsby-plugin-google-gtag`:
  - Add `delayOnRouteUpdate` option, via [PR #37017](https://github.com/gatsbyjs/gatsby/pull/37017)
- `gatsby-graphiql-explorer`
  - Fix refresh endpoint env var logic in GraphiQL v2 explorer, via [PR #37032](https://github.com/gatsbyjs/gatsby/pull/37032)
- `gatsby-source-wordpress`:
  - Fix store not containing auth credentials, via [PR #37006](https://github.com/gatsbyjs/gatsby/pull/37006)
- `gatsby-transformer-csv`:
  - Fix high memory consumption when loading large CSV file, via [PR #36610](https://github.com/gatsbyjs/gatsby/pull/36610)

## Contributors

A big **Thank You** to [our community who contributed][full-changelog] to this release 💜

TODO

[full-changelog]: https://github.com/gatsbyjs/gatsby/compare/gatsby@5.1.0-next.0...gatsby@5.1.0
