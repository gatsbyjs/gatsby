---
title: Migrating from v4 to v5
---

Looking for the [v4 docs](https://v4.gatsbyjs.com)?

> Have you run into something that's not covered here? [Add your changes to GitHub](https://github.com/gatsbyjs/gatsby/blob/master/docs/docs/reference/release-notes/migrating-from-v4-to-v5.md)!

## Introduction

This is a reference for upgrading your site from Gatsby 4 to Gatsby 5. Version 5 introduces the Slice API and Partial Hydration (Beta). Slices unlock up to 90% reduction in build duration for content changes in highly shared components, Partial Hydration allows you to ship only the necessary JavaScript to the browser. If you're curious what's new, head over to the [v5.0 Release Notes](/docs/reference/release-notes/v5.0/).

For most users we expect a **smooth upgrade path** as only a couple of changes will be required: [Updating to Node 18](#minimal-nodejs-version-1800), [switching to React 18](#minimal-required-react-version-is-18), and [changing GraphQL queries](#graphql-schema-changes-to-sort-and-aggregation-fields) using a codemod.

## Table of contents

- [Handling Deprecations](#handling-deprecations)
- [Updating Your Dependencies](#updating-your-dependencies)
- [Handling Breaking Changes](#handling-breaking-changes)
- [Future Breaking Changes](#future-breaking-changes)
- [For Plugin Maintainers](#for-plugin-maintainers)
- [Known Issues](#known-issues)

## Handling deprecations

Before upgrading to v5 we highly recommend upgrading `gatsby` (and all plugins) to the latest v4 version.
Some changes required for Gatsby 5 can be applied incrementally to the latest v4, which should contribute to a smoother upgrade experience.

> You can run the `npm outdated` or `yarn upgrade-interactive` commands in your project to upgrade to the latest v4 release interactively.

After upgrading, run `gatsby build` and look for deprecation messages in the build log. Follow instructions to fix those deprecations.

## Updating your dependencies

Next, you need to update your dependencies. We recommend [upgrading to Node 18](#minimal-nodejs-version-1800) prior to updating your dependencies to ensure that the correct package contents are installed.

### Update Gatsby version

You need to update your `package.json` to use the `latest` version of Gatsby.

```json:title=package.json
{
  "dependencies": {
    "gatsby": "^5.0.0"
  }
}
```

Or run

```shell
npm install gatsby@latest
```

Please note: If you use npm 7 or higher you'll want to use the `--legacy-peer-deps` option when following the instructions in this guide. For example, the above command would be:

```shell
npm install gatsby@latest --legacy-peer-deps
```

### Update React version

You need to update your `package.json` to use the `latest` version of `react` and `react-dom`.

```json:title=package.json
{
  "dependencies": {
    "react": "^18.0.0",
    "react-dom": "^18.0.0"
  }
}
```

Or run

```shell
npm install react@latest react-dom@latest
```

Please note: If you use npm 7 or higher you'll want to use the `--legacy-peer-deps` option when following the instructions in this guide. For example, the above command would be:

```shell
npm install react@latest react-dom@latest --legacy-peer-deps
```

### Update Gatsby related packages

Update your `package.json` to use the `latest` version for all Gatsby related packages. You should upgrade any package name that starts with `gatsby-*`. Note that this only applies to plugins managed in the [gatsbyjs/gatsby](https://github.com/gatsbyjs/gatsby) repository. All packages we manage received a major version bump. Community plugins may not be upgraded yet so please check their repository for the current status.

For example, if you have `gatsby-plugin-image` installed in your project, update that package to use the `latest` version:

```diff:title=package.json
{
  "dependencies": {
-   "gatsby-plugin-image": "^2.0.0"
+   "gatsby-plugin-image": "^3.0.0"
  }
}
```

#### Updating community plugins

Using community plugins, you might see warnings like these in your terminal:

```shell
warning Plugin gatsby-plugin-acme is not compatible with your gatsby version 5.0.0 - It requires gatsby@^4.10.0
```

If you are using npm 7, the warning may instead be an error:

```shell
npm ERR! ERESOLVE unable to resolve dependency tree
```

This is because the plugin needs to update its `peerDependencies` to include the new version of Gatsby (see section [for plugin maintainers](#for-plugin-maintainers)). While this might indicate that the plugin has incompatibilities, in most cases they should continue to work. When using npm 7 or later, you can pass the `--legacy-peer-deps` to ignore the warning and install anyway. If your build is failing on Gatsby Cloud, you can add a `.npmrc` file with that flag enabled like this:

```shell
npm config -L project set legacy-peer-deps true
```

Please look for already opened issues or PRs on the plugin's repository to see the status. If you don't see any, help the maintainers by opening an issue or PR yourself! :)

## Handling breaking changes

This section explains breaking changes that were made for Gatsby 5. Some of those changes had a deprecation message in v4. In order to successfully update, you'll need to resolve these changes.

If you're curious about our release schedules and which versions are officially supported, head to the [Gatsby Framework Version Support](/docs/reference/release-notes/gatsby-version-support/) document. As of Gatsby 5 we're no longer supporting Gatsby 2 and Gatsby 3.

### Minimal Node.js version 18.0.0

We are dropping support for Node 14 and 16 as our currently supported Node 14 version will reach EOL during the Gatsby 5 lifecycle. Since the timing of the "Active LTS" status of Node 18 is nearly the same as Gatsby 5 we're jumping directly to Node 18. See the main changes in [Node 18 release notes](https://nodejs.org/en/blog/release/v18.0.0/).

Check [Node’s releases document](https://github.com/nodejs/Release#nodejs-release-working-group) for version statuses.

### Minimal required React version is 18

We are dropping official support for React 16 and 17. The new minimal required version is React 18. This is a requirement for the Partial Hydration feature.

### Non-ESM browsers are not polyfilled by default

Gatsby's `browserlist` configuration changed to now include `supports es6-module` by default. This means that Non-ESM browsers (like Internet Explorer) are not polyfilled anymore. If you still need to support those browsers you'll need to [adjust your browserlist configuration](/docs/how-to/custom-configuration/browser-support/).

### GraphQL schema: Changes to sort and aggregation fields

As per the [RFC: Change to sort and aggregation fields API](https://github.com/gatsbyjs/gatsby/discussions/36242) the `sort` argument and aggregation's `field` argument were changed from enums to nested input objects. This change enabled lower resource usage and faster "building schema" step.

We provide a codemod (via [gatsby-codemods](https://github.com/gatsbyjs/gatsby/tree/master/packages/gatsby-codemods)) for you to easily convert your queries to the new syntax. Go to your project and run the following in your terminal:

```shell
npx gatsby-codemods@latest sort-and-aggr-graphql .
```

This will apply the codemod to all your files. If you only want to run it on some files/directories, adjust the last parameter (`npx gatsby-codemods@latest sort-and-aggr-graphql <filepath>`).

The old syntax will continue to work as Gatsby automatically applies the mentioned codemod and transforms your code, however we strongly encourage you to permanently migrate your queries to the new syntax. This way you won't see deprecation messages in your terminal and can be sure that the queries work in [GraphiQL](/docs/how-to/querying-data/running-queries-with-graphiql/) (because the old ones won't).

Examples of syntax before and after the codemod is applied:

**Sort:**

Before:

```graphql
{
  allMarkdownRemark(sort: { fields: [frontmatter___date], order: DESC }) {
    nodes {
      ...fields
    }
  }
}
```

After:

```graphql
{
  allMarkdownRemark(sort: { frontmatter: { date: DESC } }) {
    nodes {
      ...fields
    }
  }
}
```

**Aggregation:**

Before:

```graphql
{
  allMarkdownRemark {
    distinct(field: frontmatter___category)
  }
}
```

After:

```graphql
{
  allMarkdownRemark {
    distinct(field: { frontmatter: { category: SELECT } })
  }
}
```

### `trailingSlash` is set to `always`

In Gatsby 4 the default for the [`trailingSlash` option](/docs/reference/config-files/gatsby-config/#trailingslash) was set to `legacy`. With Gatsby 5 the `legacy` option was removed and the new default is `always`. This means that every URL will have a trailing slash. You can [configure this option](/docs/reference/config-files/gatsby-config/#trailingslash) in your `gatsby-config` file. We recommend that you explicitly define your desired `trailingSlash` behavior. This change will also impact your redirects so make sure that everything is consistent.

```javascript:title=gatsby-config.js
module.exports = {
  trailingSlash: `always`,
}
```

### Removal of `useNavigate` hook

We updated our [`@gatsbyjs/reach-router` fork](https://github.com/gatsbyjs/reach-router) to be compatible with React 18 and React server components. While doing that we removed the `useNavigate` hook. Please use `navigate` instead:

```diff
- import { useNavigate } from "@gatsbyjs/reach-router"
+ import { navigate } from "gatsby"
```

### Removal of obsolete flags and environment variables

Throughout the lifecycles of Gatsby 3 & 4 we introduced a couple of feature flags to incrementally ship features to Gatsby. In Gatsby 5 we removed all feature flags and environment variables that are enabled by default. You should remove these flags from your `gatsby-config` as they don't have an effect anymore (you can't enable or disable them):

- `QUERY_ON_DEMAND`
- `LAZY_IMAGES`
- `PRESERVE_WEBPACK_CACHE`
- `DEV_WEBPACK_CACHE`
- `LMDB_STORE`
- `PARALLEL_QUERY_RUNNING`
- `GRAPHQL_TYPEGEN` (can be enabled through [gatsby-config](/docs/reference/config-files/gatsby-config/#graphqltypegen))

Each of these feature flags had a corresponding environment variable (in the format of `process.env.GATSBY_EXPERIMENTAL_%FLAG-NAME%`). These environment variables were also removed and don't have any effect anymore.

### `shouldOnCreateNode` is stable

The previously unstable API `unstable_shouldOnCreateNode` was renamed to [`shouldOnCreateNode`](/docs/reference/config-files/gatsby-node/#shouldOnCreateNode). It's considered a stable API now. The functionality is identical, so only a rename will be required.

If you've used a similar check inside `onCreateNode` as an early return we recommend completely switching to the `shouldOnCreateNode` API (and removing the check from `onCreateNode`).

### Removal of `nodeModel.runQuery` and `nodeModel.getAllNodes`

The previously deprecated `nodeModel` methods [`runQuery`](/docs/reference/release-notes/migrating-from-v3-to-v4/#nodemodelrunquery-is-deprecated) and [`getAllNodes`](/docs/reference/release-notes/migrating-from-v3-to-v4/#nodemodelgetallnodes-is-deprecated) were removed. You'll need to use `nodeModel.findOne` and `nodeModel.findAll` instead.

The Gatsby 3 to 4 migration guide has instructions on how to update [`runQuery`](/docs/reference/release-notes/migrating-from-v3-to-v4/#nodemodelrunquery-is-deprecated) and [`getAllNodes`](/docs/reference/release-notes/migrating-from-v3-to-v4/#nodemodelgetallnodes-is-deprecated).

### Update to `graphql` 16

The internal `graphql` dependency was updated from v15 to v16. In most cases this change will be invisible to you and no action is required. However, if you reached into `gatsby/graphql` or are relying on TypeScript types for `graphql` v15, you might need to look into the [graphql v16 release notes](https://github.com/graphql/graphql-js/releases/tag/v16.0.0).

### Removal of GraphQL Playground

Maybe you didn't know, but Gatsby supported [GraphQL Playground](https://github.com/graphql/graphql-playground) as an alternative to [GraphiQL](https://github.com/graphql/graphiql/tree/main/packages/graphiql) for some time now. With Gatsby 5 we've updated GraphiQL to v2 which has feature parity with GraphQL Playground. Thus we removed the `GATSBY_GRAPHQL_IDE` environment variable and GraphQL Playground. Visit the [GraphiQL guide](/docs/how-to/querying-data/running-queries-with-graphiql/) to learn more about GraphiQL v2.

### Gatsby related packages

Breaking changes in plugins that we own and maintain.

#### gatsby-plugin-sitemap

The default setting for the `output` option changed from `/sitemap` to `/`. This means that `sitemap-index.xml` will now be created at the root of the site.

#### gatsby-plugin-mdx

`gatsby-plugin-mdx` now includes [`remark-unwrap-images`](https://github.com/remarkjs/remark-unwrap-images) by default. When using `gatsby-plugin-mdx` and `gatsby-remark-images` together, the images were placed inside `<p>` tags which is invalid HTML (as the images are a combination of `<div>`, `<span>`, and `<picture>`). We see this as a breaking change as your CSS might depend on this hierarchy.

You can uninstall `remark-unwrap-images` from your project if you used it inside the `mdxOptions.remarkPlugins` array.

**Please note:** If you haven't done the [migration from v3 to v4 for `gatsby-plugin-mdx`](/plugins/gatsby-plugin-mdx/#migrating-from-v3-to-v4), please be aware that you'll **need to** go through that migration process if you want to use the latest version of `gatsby-plugin-mdx` with Gatsby 5.

## Future breaking changes

This section explains deprecations that were made for Gatsby 5. These old behaviors will be removed in v6, at which point they will no longer work. For now, you can still use the old behaviors in v5, but we recommend updating to the new signatures to make future updates easier.

### `<StaticQuery />` is deprecated

The `<StaticQuery />` component has been deprecated. Please use `useStaticQuery` instead. For more information, see the [`useStaticQuery` guide](/docs/how-to/querying-data/use-static-query/#composing-custom-usestaticquery-hooks). `<StaticQuery />` will be removed in Gatsby 6.

**Migration:**

Before:

```jsx
import React from "react"
import { StaticQuery, graphql } from "gatsby"

export default function Title() {
  return (
    <StaticQuery
      query={graphql`
        query {
          site {
            siteMetadata {
              title
            }
          }
        }
      `}
      render={data => <h1>{data.site.siteMetadata.title}</h1>}
    />
  )
}
```

After:

```jsx
import React from "react"
import { useStaticQuery, graphql } from "gatsby"

export default function Title() {
  const data = useStaticQuery(graphql`
    query {
      site {
        siteMetadata {
          title
        }
      }
    }
  `)

  return <h1>{data.site.siteMetadata.title}</h1>
}
```

### Page props will be unified in browser and server environments

React 18 introduced [stricter hydration errors](https://reactjs.org/blog/2022/03/08/react-18-upgrade-guide.html#other-breaking-changes), thrown when your server-rendered JSX and client-rendered JSX does not match.

Given that these errors can be difficult to debug, we intend to unify as much as possible the props that are passed to your page components during server rendering in Node and client rendering in the browser.

Page props in v6 will consist of:

```js
const { location, params, data, pageContext, serverData } = props
```

Effective changes in v6 will include:

- Remove `pageResources` prop currently only available in browser context (it's an internal data structure)
- Remove `*` prop currently only available in server context (in favor of `location` prop)
- Remove `path` prop that currently differs in server and browser context (in favor of `location` prop)
- Remove `uri` prop in favor of `location` prop

The `location` prop will remain different in the browser and server context due to the router offering more properties in the browser context from `window.location`.

### `___NODE` convention is deprecated

In the [v3 to v4 release notes](/docs/reference/release-notes/migrating-from-v3-to-v4/#___node-convention-is-deprecated) we mentioned that the `___NODE` convention is deprecated. This is still the case for Gatsby 5 since we didn't get to migrate all important plugins to the new syntax. So this syntax will continue to work in Gatsby 5, but we **urge** you to migrate to the `@link` directive. [Get more information](/docs/reference/release-notes/migrating-from-v3-to-v4/#___node-convention-is-deprecated).

## For plugin maintainers

In most cases, you won't have to do anything to be v5 compatible. But one thing you can do to be certain your plugin won't throw any warnings or errors is to set the proper peer dependencies.

Please also note that some of the items inside "Handling Breaking Changes" may also apply to your plugin.

`gatsby` should be included under `peerDependencies` of your plugin and it should specify the proper versions of support.

```diff:title=package.json
{
  "peerDependencies": {
-   "gatsby": "^4.0.0",
+   "gatsby": "^5.0.0",
  }
}
```

If your plugin supports both versions:

```diff:title=package.json
{
  "peerDependencies": {
-   "gatsby": "^4.0.0",
+   "gatsby": "^4.0.0 || ^5.0.0",
  }
}
```

If you defined the `engines` key you'll also need to update the minimum version:

```json:title=package.json
{
  "engines": {
    "node": ">=18.0.0"
  }
}
```

## Known issues

This section is a work in progress and will be expanded when necessary. It's a list of known issues you might run into while upgrading Gatsby to v5 and how to solve them.

If you encounter any problem, please let us know in this [GitHub discussion](https://github.com/gatsbyjs/gatsby/discussions/36609).

### Multiple versions of `graphql`

Since we updated the internal `graphql` dependency to [v16](#update-to-graphql-16) you might run into a problem like this:

```shell
Cannot create as TypeComposer the following value:
  GraphQLScalarType({ name: "Date", description: "A date string, such as 2007-12-03, compliant with the
 ISO 8601 standard for representation of dates and times using the Gregorian calendar.",
specifiedByURL: undefined, serialize: [function String], parseValue: [function String], parseLiteral:
[function parseLiteral], extensions: {  }, astNode: undefined, extensionASTNodes: [] }).
```

This error (or any other similar errors) happens when you have multiple versions of `graphql` installed in your project. You can check this manually by running:

```shell
npm ls graphql
```

Or with `yarn`:

```shell
yarn why graphql
```

A brute-force way of solving this is to delete your lock file, delete `node_modules` and re-install with `npm install --legacy-peer-deps`/`yarn install`. This only works though if your project is just `gatsby`, if you have a more complicated setup you might need to use features like `resolutions`.
