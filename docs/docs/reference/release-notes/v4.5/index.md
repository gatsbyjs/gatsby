---
date: "2022-01-11"
version: "4.5.0"
title: "v4.5 Release Notes"
---

Welcome to `gatsby@4.5.0` release (January 2022 #1)

Key highlights of this release:

- [Gracefully Handling Browser Cache Issues](#todo)
- [TypeScript Types for `getServerData`](#todo)
- [Deprecation of `gatsby-recipes`](#todo)

Also check out [notable bugfixes](#notable-bugfixes--improvements).

**Bleeding Edge:** Want to try new features as soon as possible? Install `gatsby@next` and let us know
if you have any [issues](https://github.com/gatsbyjs/gatsby/issues).

[Previous release notes](/docs/reference/release-notes/v4.4)

[Full changelog][full-changelog]

---

## Gracefully Handling Browser Cache Issues

If you've seen the error `The result of this StaticQuery could not be fetched`, `Loading (StaticQuery)`, or `We couldn't find the correct component chunk with the name` you might have run into issues regarding `useStaticQuery` and some form of browser cache. More details are laid out in these two issues: [#33956](https://github.com/gatsbyjs/gatsby/issues/33956) and [#33112](https://github.com/gatsbyjs/gatsby/issues/33112).

The way we could reproduce this problem was using cached HTML from previous build (which would use previous JavaScript bundles), that would fetch new data (from newer builds). In those cases wrong static queries were fetched as the cached HTML expected other bundles.

In [#34225](https://github.com/gatsbyjs/gatsby/pull/34225) we've added an integrity check to Gatsby's runtime to see if the loaded HTML & JavaScript is matching the new data, and if not a single (forced) reload tries to fetch the updated assets.

If you've run into problems like these, please upgrade and let us know (in the two issues mentioned above) if your problem is resolved.

## TypeScript Types for `getServerData`

Gatsby now ships with TypeScript types for the `getServerData` function. You can use the `GetServerDataProps` and `GetServerDataReturn` as following:

```tsx
import * as React from "react"
import { GetServerDataProps, GetServerDataReturn } from "gatsby"

type ServerDataProps = {
  hello: string
}

const Page = () => <div>Hello World</div>
export default Page

export async function getServerData(
  props: GetServerDataProps
): GetServerDataReturn<ServerDataProps> {
  return {
    status: 200,
    headers: {},
    props: {
      hello: "world",
    },
  }
}
```

If you're using an anonymous function, you can also use the shorthand `GetServerData` type like this:

```tsx
const getServerData: GetServerData<ServerDataProps> = async props => {
  // your function body
}
```

## Deprecation of `gatsby-recipes`

In early 2020 we've [introduced Gatsby Recipes](/blog/2020-04-15-announcing-gatsby-recipes/) to automate common site building tasks. Since then our priorities and plans on that front for Gatsby have shifted, thus `gatsby-recipes` itself didn't ever go from alpha status to general availability. We're deprecating `gatsby-recipes` now to signal that we'll no longer will continue work on this specific package and to also remove some heavy dependencies from `gatsby-cli`. Some deprecation warnings or audit messages about packages from `gatsby-recipes` should be gone now.

You can continue to use it via `gatsby-cli@4.4.0` and the source itself will live inside the `deprecated-packages` folder in the [monorepo](https://github.com/gatsbyjs/gatsby/tree/master/deprecated-packages).

If you've liked the features in `gatsby-recipes` and would like to have something similar in the future, feel free to open a [feature request](https://github.com/gatsbyjs/gatsby/discussions/categories/ideas-feature-requests) in our discussions forum. Thanks!

## Notable Bugfixes & Improvements

- A lot of internal dependency updates to some packages. You can check the `CHANGELOG.md` file in each package’s folder for the details.
- If you want to know how to enable [Content Sync](/docs/conceptual/content-sync/) in your source plugin, you can read the [updated guide](/docs/how-to/plugins-and-themes/creating-a-source-plugin/#enabling-content-sync) now.
- `gatsby`
  - When using the File System Route API and SSR rendering mode, the routing between individual pages and a catch-all splat route was not correctly resolved. The `findPageByPath` function was updated to use another algorithm to find the correct page, via [PR #34070](https://github.com/gatsbyjs/gatsby/pull/34070)
  - Remove unused exports from query engine, via [PR #33484](https://github.com/gatsbyjs/gatsby/pull/33484)
  - Resolve `createNode` promise when LMDB datastore is ready to fix issues where nodes were not created, via [PR #34277](https://github.com/gatsbyjs/gatsby/pull/34277)
  - Reorder `<head>` tags so that e.g. large stylesheets don't block parsers from getting meta tags, via [PR #34030](https://github.com/gatsbyjs/gatsby/pull/34030)
- `gatsby-plugin-preact`: Fix exports resolution to get it working with Gatsby 4, via [PR #34337](https://github.com/gatsbyjs/gatsby/pull/34337)
- `gatsby-source-contentful`:
  - Calculate aspect ratio for `base64` previews correctly, via [PR #33533](https://github.com/gatsbyjs/gatsby/pull/33533)
  - Fix issue where images were not downloaded when using `downloadLocal`, via [PR #34276](https://github.com/gatsbyjs/gatsby/pull/34276)
- `gatsby-cli`: Make `--inspect-brk` work with specified port, via [PR #34242](https://github.com/gatsbyjs/gatsby/pull/34242)
- `gatsby-source-filesystem`: Replace special filename characters, via [PR #34249](https://github.com/gatsbyjs/gatsby/pull/34249)

## Contributors

A big **Thank You** to [our community who contributed][full-changelog] to this release 💜

TODO

[full-changelog]: https://github.com/gatsbyjs/gatsby/compare/gatsby@4.5.0-next.0...gatsby@4.5.0
