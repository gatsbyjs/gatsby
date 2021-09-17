---
date: "2021-09-17"
version: "3.14.0"
title: "v3.14 Release Notes"
---

Welcome to `gatsby@3.14.0` release (September 2021 #1)

> This is the final minor release for gatsby v3. Gatsby v4 beta is already published behind
> the `next` npm tag and the next stable release will be `gatsby@4.0.0`. [See what's inside!](/gatsby-4/)
>
> We will keep publishing patches for 3.14.x with hotfixes until `4.0.0` stable is published and at least several
> weeks after.

TODO: Key highlights of this release:

- [Better navigation UX](#better-navigation-ux) - reload the app on navigation errors caused by the new deployment
- [Improved developer tools](#improved-developer-tools) - `createPages` snippet in GraphiQL and new GraphQL query capability
- [Preparations for gatsby v4](#preparations-for-gatsby-v4) - API deprecations; new home for `gatsby-plugin-netlify`
- [`gatsby-source-drupal` improvements](#gatsby-source-drupal-improvements)

Also check out [notable bugfixes](#notable-bugfixes--improvements).

**Bleeding Edge:** Want to try new features as soon as possible? Install `gatsby@next` and let us know
if you have any [issues](https://github.com/gatsbyjs/gatsby/issues).

[Previous release notes](/docs/reference/release-notes/v3.13)

[Full changelog](https://github.com/gatsbyjs/gatsby/compare/gatsby@3.14.0-next.0...gatsby@3.14.0)

---

## Better navigation UX

TODO: reload the app on navigation errors caused by the new deployment
https://github.com/gatsbyjs/gatsby/pull/33032

## Improved developer tools

TODO: `createPages` snippet in GraphiQL
https://github.com/gatsbyjs/gatsby/pull/32968

TODO: added GraphQL aggregation fields to group
https://github.com/gatsbyjs/gatsby/pull/32533

## Preparations for gatsby v4

TODO `gatsby-plugin-netlify`: moved to new repository

TODO: `gatsby`: Deprecate schema-related APIs in sourceNodes
https://github.com/gatsbyjs/gatsby/pull/32291

## `gatsby-source-drupal` improvements

TODO:

https://github.com/gatsbyjs/gatsby/pull/32971 - delete relationships to now deleted nodes
https://github.com/gatsbyjs/gatsby/pull/33079 - validate webhook bodies & updated node data
https://github.com/gatsbyjs/gatsby/pull/33099 - guard against already deleted nodes
https://github.com/gatsbyjs/gatsby/pull/33143 - handle edge case with deleting nodes
https://github.com/gatsbyjs/gatsby/pull/33142 - Add tracing for full/delta fetches and http requests
https://github.com/gatsbyjs/gatsby/pull/33181 - check relationships type exists on node before filtering

## Notable bugfixes & improvements

- `gatsby`: make conditional page builds work with static queries, via [PR #32949](https://github.com/gatsbyjs/gatsby/pull/32949)
- `gatsby`: reduce page-renderer size, via [PR #33051](https://github.com/gatsbyjs/gatsby/pull/33051/)
- `gatsby`: fix nesting of tracing spans + add docs for OpenTelemetry, via [PR #33098](https://github.com/gatsbyjs/gatsby/pull/33098)
- `gatsby`: don't bundle moment locale files, via [PR #33092](https://github.com/gatsbyjs/gatsby/pull/33092)
- `gatsby`: add environment variable for setting tracing config file, via [PR #32513](https://github.com/gatsbyjs/gatsby/pull/32513)
- `gatsby`: Assign parentSpan to activities that were missing them, via [PR #33122](https://github.com/gatsbyjs/gatsby/pull/33122)
- `gatsby-source-contentful`: fix error "Unable to download asset", via [PR #33024](https://github.com/gatsbyjs/gatsby/pull/33024)
- `gatsby-transformer-sqip`: ensure failed asset downloads do not break build, via [PR #33037](https://github.com/gatsbyjs/gatsby/pull/33037)
- `gatsby-plugin-google-tagmanager`: ability to serve gtm.js from "self-hosted" tagging server, via [PR #32733](https://github.com/gatsbyjs/gatsby/pull/32733)
- `gatsby-plugin-styled-components`: Add ability to disable vendor prefixes, via [PR #33147](https://github.com/gatsbyjs/gatsby/pull/33147)

## Contributors

A big **Thank You** to [our community who contributed](https://github.com/gatsbyjs/gatsby/compare/gatsby@3.14.0-next.0...gatsby@3.14.0) to this release 💜

TODO
