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

Key highlights of this release:

- [Better UX for navigation in the middle of deployment](#better-ux-for-navigation-in-the-middle-of-deployment)
- [New developer tools](#new-developer-tools) - `createPages` snippet in GraphiQL and new GraphQL capability
- [Preparations for gatsby v4](#preparations-for-gatsby-v4) - API deprecations; migration guide; docs
- [Improvements for `gatsby-source-drupal`](#gatsby-source-drupal-improvements)
- [New home for `gatsby-plugin-netlify`](#new-home-for-gatsby-plugin-netlify)

Also check out [notable bugfixes](#notable-bugfixes--improvements).

**Bleeding Edge:** Want to try new features as soon as possible? Install `gatsby@next` and let us know
if you have any [issues](https://github.com/gatsbyjs/gatsby/issues).

[Previous release notes](/docs/reference/release-notes/v3.13)

[Full changelog](https://github.com/gatsbyjs/gatsby/compare/gatsby@3.14.0-next.0...gatsby@3.14.0)

---

## Better UX for navigation in the middle of deployment

This release solves a common UX problem with navigation in the middle of deployment.
Imagine the following scenario:

1. Users loads a page
2. New version of the site is deployed
3. User tries to navigate to another page with `gatsby-link`

However, nothing happens and there are some JS errors in the console.

It happens because paths of JS chunks change with the new deployment and so the old chunks cannot be found.
This problem is now addressed in Gatsby automatically. Once we spot this error, the page is hard-reloaded for the user.

This was one of the most [upvoted issues](https://github.com/gatsbyjs/gatsby/issues/18866) in our repo.
See [PR #33032](https://github.com/gatsbyjs/gatsby/pull/33032) for details.

## New developer tools

### `createPages` snippet in GraphiQL

Often, a developer will begin creating the site by examining their data layer in GraphiQL. They will then want to create pages based off of their initial query. For example:

```graphql
query MyQuery {
  allContentfulBlogPosts {
    nodes {
      id
      slug
    }
  }
}
```

Usually this will end up with this code in `gatsby-node.js`:

```javascript
const path = require(`path`)

exports.createPages = async ({ graphql, actions }) => {
  const { createPage } = actions

  const result = await graphql(`
    {
      allContentfulBlogPosts {
        nodes {
          id
          slug
        }
      }
    }
  `)
  const templatePath = path.resolve(`PATH/TO/TEMPLATE.js`)

  result.data.allContentfulBlogPosts.nodes.forEach(node => {
    createPage({
      path: NODE_SLUG,
      component: templatePath,
      context: {
        slug: NODE_SLUG,
      },
    })
  })
}
```

Doing it manually is tedious, but now you can generate this snippet from GraphiQL
and paste to `gatsby-node.js`!

See [PR #32968](https://github.com/gatsbyjs/gatsby/pull/32968) for details.

### Added GraphQL aggregation fields to group

Now you can apply `max`, `min`, `distinct`, `sum`, `group` to grouped nodes. In other words,
a query like this is now possible:

```graphql
{
  allMarkdown {
    group(field: frontmatter___authors___name) {
      fieldValue
      group(field: frontmatter___title) {
        fieldValue
        max(field: frontmatter___price)
      }
    }
  }
}
```

See [PR #32533](https://github.com/gatsbyjs/gatsby/pull/32533) for details.

## Preparations for gatsby v4

Actions used for schema customization should not be used in `sourceNodes` API anymore:
namely `createTypes`, `createFieldExtension` and `addThirdPartySchema`.

Usage of those actions in `sourceNodes` is deprecated as of this release and will break in [Gatsby v4](/gatsby-4/).

Also check out the [migration guide](#) (work in progress!) for other upcoming breaking changes and don't hesitate to
let us know what you think in [GitHub discussion](https://github.com/gatsbyjs/gatsby/discussions/32860).

## `gatsby-source-drupal` improvements

The plugin got a fair share of improvements and bugfixes for warm and incremental builds:

- Fix GraphQL schema errors and crashes when deleting nodes, PRs [#32971](https://github.com/gatsbyjs/gatsby/pull/32971), [#33099](https://github.com/gatsbyjs/gatsby/pull/33099), [#33143](https://github.com/gatsbyjs/gatsby/pull/33143) and [#33181](https://github.com/gatsbyjs/gatsby/pull/33181)
- Warn on bad webhook format: [PR #33079](https://github.com/gatsbyjs/gatsby/pull/33079)
- Add tracing for full/delta fetches and http requests: [PR #33142](https://github.com/gatsbyjs/gatsby/pull/33142)

## New home for `gatsby-plugin-netlify`

The plugin is moved to https://github.com/netlify/gatsby-plugin-netlify Go check it out for the latest source code.

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

- [tackaberry](https://github.com/tackaberry): feat(gatsby-plugin-google-tagmanager): add option for selfHostedOrigin [PR #32733](https://github.com/gatsbyjs/gatsby/pull/32733)
- [herecydev](https://github.com/herecydev)

  - fix(gatsby): set staticQueryResultHash to new hash on data change [PR #32949](https://github.com/gatsbyjs/gatsby/pull/32949)
  - feat(gatsby-plugin-styled-components): Add ability to disable vendor prefixes [PR #33147](https://github.com/gatsbyjs/gatsby/pull/33147)

- [ascorbic](https://github.com/ascorbic): chore: add missing `@babel/runtime` dependencies [PR #32954](https://github.com/gatsbyjs/gatsby/pull/32954)
- [axe312ger](https://github.com/axe312ger)

  - fix(contentful): asset download retry [PR #33024](https://github.com/gatsbyjs/gatsby/pull/33024)
  - test(CTF): ensure changing base64 previews don't break rich text tests [PR #33027](https://github.com/gatsbyjs/gatsby/pull/33027)
  - fix(sqip): ensure failed asset downloads do not break build [PR #33037](https://github.com/gatsbyjs/gatsby/pull/33037)

- [Himadu2000](https://github.com/Himadu2000): fix(starters): Formats for StaticImage [PR #33057](https://github.com/gatsbyjs/gatsby/pull/33057)
- [merceyz](https://github.com/merceyz): fix: add missing dependencies [PR #31837](https://github.com/gatsbyjs/gatsby/pull/31837)
- [actuallyatiger](https://github.com/actuallyatiger): chore(docs): Update GitHub Pages doc [PR #29031](https://github.com/gatsbyjs/gatsby/pull/29031)
- [acbramley](https://github.com/acbramley): Document filtering temporary files [PR #32048](https://github.com/gatsbyjs/gatsby/pull/32048)
- [jabrks](https://github.com/jabrks): fix(gatsby): Don't bundle moment locale files [PR #33092](https://github.com/gatsbyjs/gatsby/pull/33092)
- [nagiek](https://github.com/nagiek): feat(gatsby): Add aggregation resolvers to group [PR #32533](https://github.com/gatsbyjs/gatsby/pull/32533)
- [aleksanderantropov](https://github.com/aleksanderantropov)

  - chore(docs): Correct gatsby-cloud plugin in tutorial part 3 [PR #33118](https://github.com/gatsbyjs/gatsby/pull/33118)
  - docs: fix typo [PR #33137](https://github.com/gatsbyjs/gatsby/pull/33137)

- [bartveneman](https://github.com/bartveneman): docs(gatsby-plugin-gatsby-cloud): fix typo: asterix -> asterisk [PR #33135](https://github.com/gatsbyjs/gatsby/pull/33135)
- [rudouglas](https://github.com/rudouglas): chore(gatsby): add environment variable for setting tracing config file [PR #32513](https://github.com/gatsbyjs/gatsby/pull/32513)
- [minimalsm](https://github.com/minimalsm): docs: Fix broken link on Getting Started with MDX page [PR #33148](https://github.com/gatsbyjs/gatsby/pull/33148)
