---
title: Migrating from v2 to v3
---

Looking for the v2 docs? [Find them here.](https://v2.gatsbyjs.com)

> This document is a work in progress. Have you run into something that's not covered here? [Add your changes to GitHub!](https://github.com/gatsbyjs/gatsby/tree/master/docs/docs/reference/release-notes/migrating-from-v2-to-v3.md)

## Introduction

This is a reference for upgrading your site from Gatsby v2 to Gatsby v3. Since the last major release was in September 2018, Gatsby v3 includes a couple of breaking changes. If you're curious what's new, head over to the [v3.0 release notes](/docs/reference/release-notes/v3.0).

> If you want to start fresh, run `npm init gatsby` or `yarn create gatsby` in your terminal.

## Updating Your Dependencies

First, you need to update your dependencies.

### Update Gatsby version

You need to update your `package.json` to use the latest version of Gatsby.

```json:title=package.json
{
  "dependencies": {
    "gatsby": "^3.0.0"
  }
}
```

Or run

```shell
npm install gatsby@latest
```

**Please note:** If you use **npm 7** you'll want to use the `--legacy-peer-deps` option when following the instructions in this guide. For example, the above command would be:

```shell
npm install gatsby@latest --legacy-peer-deps
```

### Update Gatsby related packages

Update your `package.json` to use the latest version of Gatsby related packages. You should upgrade any package name that starts with `gatsby-*`. Note, this only applies to plugins managed in the [gatsbyjs/gatsby](https://github.com/gatsbyjs/gatsby) repository. If you're using community plugins, they might not be upgraded yet. Many plugins won't need updating so they may keep working (if not, please check their repository for the current status). You can run an npm script to see all outdated dependencies.

#### npm

```shell
npm outdated
```

Compare the "Wanted" and "Latest" versions and update their versions accordingly. For example, if you have this oudated version:

```shell
> npm outdated

Package                  Current   Wanted  Latest  Location
gatsby-plugin-sharp      2.14.1    2.14.1  3.0.0   test
```

Install the new package with:

```shell
npm install gatsby-plugin-sharp@latest
```

#### yarn

```shell
yarn upgrade-interactive --latest
```

You'll be given an overview of packages where you can select to upgrade them to `latest`.

#### Updating community plugins

Using community plugins you might see warnings like these in your terminal:

```shell
warning Plugin gatsby-plugin-acme is not compatible with your gatsby version 3.0.0 - It requires gatsby@^2.32.0
```

This is because the plugin needs to set its `peerDependencies` to the new version of Gatsby (see section [for plugin maintainers](#for-plugin-maintainers)). While this might indicate that the plugin has incompatibilities, in most cases they should continue to work. Please look for already opened issues or PRs on the plugin's repository to see the status. If you don't see any, help the maintainers by opening an issue or PR yourself! :)

## Handling Breaking Changes

This section explains breaking changes that were made for Gatsby v3. Most, if not all, of those changes had a deprecation message in v2. In order to successfully update you'll need to resolve these changes.

### Minimal Node.js version 12.13.0

Gatsby now requires at least `12.13.0` for its Node.js version.

### Gatsby's Link component

The APIs `push`, `replace` & `navigateTo` in `gatsby-link` (an internal package) were deprecated in v2 and now with v3 completely removed. Please use `navigate` instead.

```diff
import React from "react"
- import { navigateTo, push, replace } from "gatsby"
+ import { navigate } from "gatsby"

const Form = () => (
  <form
    onSubmit={event => {
      event.preventDefault()

-     navigateTo("/form-submitted/") // or push() or replace()
+     navigate("/form-submitted/")
    }}
  >
)
```

### Removal of `__experimentalThemes`

The deprecated `__experimentalThemes` key inside `gatsby-config.js` was removed. You'll need to define your Gatsby themes inside the `plugins` array instead.

```diff:title=gatsby-config.js
module.exports = {
- __experimentalThemes: ["gatsby-theme-blog"]
+ plugins: ["gatsby-theme-blog"]
}
```

### Removal of `pathContext`

The deprecated API `pathContext` was removed. You need to rename instances of it to `pageContext`. For example, if you passed information inside your `gatsby-node.js` and accessed it in your page:

```diff:title=src/templates/context.jsx
import React from "react"

- const ContextPage = ({ pathContext }) => (
+ const ContextPage = ({ pageContext }) => (
  <main>
    <h1>Hello from a page that uses the old pathContext</h1>
    <p>It was deprecated in favor of pageContext</p>
-   <p>{pathContext.foo}</p>
+   <p>{pageContext.foo}</p>
  </main>
)

export default ContextPage
```

### Removal of `boundActionCreators`

The deprecated API `boundActionCreators` was removed. Please rename its instances to `actions` to keep the same behavior. For example, in your `gatsby-node.js` file:

```diff:title=gatsby-node.js
exports.createPages = (gatsbyArgs, pluginArgs) => {
- const { boundActionCreators } = gatsbyArgs
+ const { actions } = gatsbyArgs
}
```

### Removal of `deleteNodes`

The deprecated API `deleteNodes` was removed. Please iterate over the `nodes` instead and call `deleteNode`:

```diff
const nodes = ["an-array-of-nodes"]
- deleteNodes(nodes)
+ nodes.forEach(node => deleteNode(node))
```

### Removal of `fieldName` & `fieldValue` from `createNodeField`

The arguments `fieldName` and `fieldValue` were removed from the `createNodeField` API. Please use `name` and `value` instead.

```diff:title=gatsby-node.js
exports.onCreateNode = ({ node, actions }) => {
  const { createNodeField } = actions

  createNodeField({
    node,
-   fieldName: "slug",
-   fieldValue: "my-custom-slug",
+   name: "slug",
+   value: "my-custom-slug",
  })
}
```

### Removal of `hasNodeChanged` from public API surface

This API is no longer necessary as there is an internal check for whether or not a node has changed.

### Removal of `sizes` & `resolutions` for image queries

The `sizes` and `resolutions` queries were deprecated in v2 in favor of `fluid` and `fixed`.

```diff
import React from "react"
import { graphql } from "gatsby"

const Example = ({ data }) => {
  <div>
-    <Img sizes={data.foo.childImageSharp.sizes} />
-    <Img resolutions={data.bar.childImageSharp.resolutions} />
+    <Img fluid={data.foo.childImageSharp.fluid} />
+    <Img fixed={data.bar.childImageSharp.fixed} />
  </div>
}

export default Example

export const pageQuery = graphql`
  query IndexQuery {
    foo: file(relativePath: { regex: "/foo.jpg/" }) {
      childImageSharp {
-        sizes(maxWidth: 700) {
-          ...GatsbyImageSharpSizes_tracedSVG
+        fluid(maxWidth: 700) {
+          ...GatsbyImageSharpFluid_tracedSVG
        }
      }
    }
    bar: file(relativePath: { regex: "/bar.jpg/" }) {
      childImageSharp {
-        resolutions(width: 500) {
-          ...GatsbyImageSharpResolutions_withWebp
+        fixed(width: 500) {
+          ...GatsbyImageSharpFixed_withWebp
        }
      }
    }
  }
`
```

### Calling `touchNode` with the node id

Calling `touchNode` with a string (the node id) was deprecated in Gatsby v2. Pass the full `node` to `touchNode` now.

```diff:title=gatsby-node.js
exports.sourceNodes = ({ actions, getNodesByType }) => {
  const { touchNode } = actions

- getNodesByType("YourSourceType").forEach(node => touchNode(node.id))
+ getNodesByType("YourSourceType").forEach(node => touchNode(node))
}
```

### Calling `deleteNode` with the node id

Calling `deleteNode` with a string (the node id) was deprecated in Gatsby v2. Pass the full `node` to `deleteNode` now.

```diff:title=gatsby-node.js
exports.onCreateNode = ({ actions, node }) => {
  const { deleteNode } = actions

- deleteNode(node.id)
+ deleteNode(node)
}
```

### Removal of three `gatsby-browser` APIs

A couple of `gatsby-browser` APIs were removed. In the list below you can find the old APIs and their replacements:

- `getResourcesForPathnameSync` => `loadPageSync`
- `getResourcesForPathname` => `loadPage`
- `replaceComponentRenderer` => `wrapPageElement`

### Using a global `graphql` tag for queries

Until now your were able to use the `graphql` tag for queries without explicitly importing it from Gatsby. You now have to import it: `import { graphql } from 'gatsby'`

```diff:title=src/pages/index.js
import React from "react"
+ import { graphql } from "gatsby"

const Page = ({ data }) => (
  <div>Show my data: {JSON.stringify(data, null, 2)}</div>
)

export default Page

export const query = graphql`
  {
    site {
      siteMetadata {
        description
      }
    }
  }
`
```

### CSS Modules are imported as ESModules

The web moves forward and so do we. ESModules allow us to better treeshake and generate smaller files. From now on you'll need to import cssModules as: `import { box } from './mystyles.module.css'`

```diff:title=src/components/Box.js
import React from "react"
- import styles from './mystyles.module.css'
+ import { box } from './mystyles.module.css'

const Box = ({ children }) => (
-  <div className={styles.box}>{children}</div>
+  <div className={box}>{children}</div>
)

export default Box
```

### GraphQL: character escape sequences in `regex` filter

In v2 backslashes in `regex` filters of GraphQL queries had to be escaped
_twice_, so `/\w+/` needed to be written as `"/\\\\w+/"`.

In v3 you only need to escape once:

```diff:title=src/pages/index.js
const query = {
  allFile(
    filter: {
-      relativePath: { regex: "/\\\\.png/" }
+      relativePath: { regex: "/\\.png/" }
    }
  ) {
    nodes {
      relativePath
    }
  }
}
```

### GraphQL: `__typename` field is no longer added automatically

In v2 we used to add the `__typename` field implicitly when querying for a field of abstract type (interface or union).
In v3 `__typename` has to be added explicitly in your query:

```diff:title=src/pages/index.js
import React from "react"
import { graphql } from "gatsby"

const Page = ({ data }) => {
  if (data.foo.someUnion.__typename === `A`) {
    return data.foo.someUnion.a
  }
  if (data.foo.someUnion.__typename === `B`) {
    return data.foo.someUnion.b
  }
  return null
}

export default Page

export const query = graphql`
  {
    foo {
      someUnion {
+       __typename
        ... on A { a }
        ... on B { b }
      }
    }
  }
`
```

### Schema Customization: Add explicit `childOf` extension to types with disabled inference

Imagine you have node type `Foo` that has several child nodes of type `Bar` (so you expect field `Foo.childBar` to exist).
In Gatsby v2 this field was added automatically even if inference was disabled for type `Foo`.

In Gatsby v3 you must declare a parent-child relationship explicitly for this case:

```diff:title=gatsby-node.js
exports.createSchemaCustomization = ({ actions }) => {
  const { createTypes } = actions
  createTypes(`
    type Foo implemenst Node @dontInfer {
       id: ID!
    }
-   type Bar implements Node {
+   type Bar implements Node @childOf(types: ["Foo"]) {
      id: ID!
    }
  `)
}
```

To make upgrading easier, check the CLI output of your site on the latest v2 and follow the suggestions
when you see a warning like this:

```shell
warning Deprecation warning: In Gatsby v3 fields `Foo.childBar` and `Foo.childrenBar`
will not be added automatically because type `Bar` does not explicitly list type `Foo`
in `childOf` extension.

Add the following type definition to fix this:

  type Bar implements Node @childOf(types: ["Foo"]) {
    id: ID!
  }

https://www.gatsbyjs.com/docs/actions/#createTypes
```

If you don't see any warnings - you are safe to upgrade to v3.

If this warning is displayed for a type defined by some plugin - open an issue in the plugin repo
with a suggestion to upgrade (and a link to this guide).

You can still fix those warnings temporarily in your site's `gatsby-node.js` until it is fixed in the plugin.

Related docs:

- [childOf directive](https://www.gatsbyjs.com/docs/reference/graphql-data-layer/schema-customization/#defining-child-relations)
- [Child/parent fields](https://www.gatsbyjs.com/docs/schema-inference/#childparent-fields)
- [Schema generation](https://www.gatsbyjs.com/docs/schema-generation/#4-parent--children-relationships)

### Schema Customization: Extensions must be set explicitly

Starting with v3 whenever you define a field of complex type, you must also assign
the corresponding extension (or a custom resolver):

```diff:title=gatsby-node.js
exports.createSchemaCustomization = ({ actions }) => {
  const { createTypes } = actions
  createTypes(`
    type MyType {
-     date: Date
+     date: Date @dateformat
-     image: File
+     image: File @fileByRelativePath
-     authorByEmail: Author
+     authorByEmail: Author @link
    }
  `)
}
```

In Gatsby v2 we add those extensions for you automatically but display a deprecation warning.

To make upgrading easier, check the CLI output of your site on the latest v2 and follow suggestions
when you see a warning like this:

```shell
warning Deprecation warning: adding inferred extension `link` for field Foo.bar
In Gatsby v3, only fields with an explicit directive/extension will be resolved correctly.
Add the following type definition to fix this:

  type Foo implements Node {
    bar: [Bar] @link(by: "id", from: "bar___NODE")
  }

https://www.gatsbyjs.com/docs/actions/#createTypes
```

If this warning is displayed for a type defined by some plugin - open an issue in the plugin repo
with a suggestion to upgrade (and a link to this guide).

You can still fix those warnings temporarily in your site's `gatsby-node.js` until it is fixed in the plugin.

If you don't see any warnings - you are safe to upgrade to v3. Read more about custom extensions in [this blog post](https://www.gatsbyjs.com/blog/2019-05-17-improvements-to-schema-customization/).

### Schema Customization: Removed `noDefaultResolvers` argument from inference directives

Search for `noDefaultResolvers` entries and remove them:

```diff:title=gatsby-node.js
exports.createSchemaCustomization = ({ actions }) => {
  const { createTypes } = actions
  createTypes(`
-   type Foo implements Node @infer(noDefaultResolvers: true)
+   type Foo implements Node @infer
    {
      id: ID!
    }

-   type Bar implements Node @dontInfer(noDefaultResolvers: true)
+   type Foo implements Node @dontInfer
    {
      id: ID!
    }

  `)
}
```

[Read deprecation announcement](https://www.gatsbyjs.com/blog/2019-05-17-improvements-to-schema-customization/#-nodefaultresolvers-and-inference-modes).

### Schema Customization: Remove `many` argument from `childOf` directive

It is no longer needed in Gatsby v3:

```diff:title=gatsby-node.js
exports.createSchemaCustomization = ({ actions }) => {
  const { createTypes } = actions
  createTypes(`
-   type Foo implements Node @childOf(types: ["Bar"], many: true)
+   type Foo implements Node @childOf(types: ["Bar"])
    {
      id: ID!
    }
  `)
}
```

### Schema Customization: Consistent return for `nodeModel.runQuery`

For Gatsby v2, `nodeModel.runQuery` with `firstOnly: false` returns `null` when nothing is found.
In v3 it returns an empty array instead.

To upgrade, find all occurrences of `runQuery` (with `firstOnly: false` or not set) and make sure checks for emptiness
are correct:

```diff:title=gatsby-node.js
exports.createResolvers = ({ createResolvers }) => {
  const resolvers = {
    Foo: {
      bars: {
        resolve(source, args, context, info) {
          const result = context.nodeModel.runQuery({
            query: {/* */},
            type: "Bar",
            firstOnly: false,
          })
-         if (result === null) {
+         if (result.length === 0) {
            throw new Error("Not found!")
          }
          return result
        },
      },
    },
  }
  createResolvers(resolvers)
}
```

**Note:** when using argument `firstOnly: true` the returned value is `object` or `null`.
So do not confuse those two cases.

## Resolving Deprecations

This section explains deprecations that were made for Gatsby v3. The old behaviors will be removed in v4. You can still use the old behaviors in v3 but we recommend updating to the new signatures.

### `touchNode`

For Gatsby v2 the `touchNode` API accepted `nodeId` as a named argument. This now has been deprecated in favor of passing the full `node` to the function.

```diff:title=gatsby-node.js
exports.sourceNodes = ({ actions, getNodesByType }) => {
  const { touchNode } = actions

- getNodesByType("YourSourceType").forEach(node => touchNode({ nodeId: node.id }))
+ getNodesByType("YourSourceType").forEach(node => touchNode(node))
}
```

In case you only have an ID at hand (e.g. getting it from cache or as `__NODE`) you can use the `getNode()` API:

```js:title=gatsby-node.js
exports.sourceNodes = async ({ actions, getNodesByType, cache }) => {
  const { touchNode, getNode } = actions
  const myNodeId = await cache.get("some-key")

  touchNode(getNode(myNodeId))
}
```

### `deleteNode`

For Gatsby v2 the `deleteNode` API accepted `node` as a named argument. This now has been deprecated in favor of passing the full `node` to the function.

```diff:title=gatsby-node.js
exports.onCreateNode = ({ actions, node }) => {
  const { deleteNode } = actions

- deleteNode({ node })
+ deleteNode(node)
}
```

### `@nodeInterface`

For Gatsby v2 `@nodeInterface` was the recommended way to implement [queryable interfaces](https://www.gatsbyjs.com/docs/reference/graphql-data-layer/schema-customization/#queryable-interfaces-with-the-nodeinterface-extension).
Now it is deprecated in favor of interface inheritance:

```diff:title=gatsby-node.js
exports.createSchemaCustomization = function createSchemaCustomization({ actions }) {
  const { createTypes } = actions
  createTypes(`
-   interface Foo @nodeInterface
+   interface Foo implements Node
    {
      id: ID!
    }
  `)
}
```

## Using `fs` in SSR

Gatsby v3 introduce incremental builds for HTML generation. For this feature to work correctly Gatsby needs to track all inputs used to generate HTML file. Arbitrary code execution in `gatsby-ssr.js` files allow usage of `fs` module which is marked as unsafe and result in disabling of this feature. To migrate you can use `import` instead of `fs`:

```diff:title=gatsby-ssr.js
import * as React from "react"
-import * as fs from "fs"
-import * as path from "path"
+import stylesToInline from "!!raw-loader!/some-auto-generated.css"

export function onRenderBody({ setHeadComponents }) {
-  const stylesToInline = fs.readFileSync(path.join(process.cwd(), `some-auto-generated.css`))
  setHeadComponents(
    <style
      dangerouslySetInnerHTML={{
        __html: stylesToInline,
      }}
    />
  )
}
```

## For Plugin Maintainers

In most cases you won't have to do anything to be v3 compatible, but there are a few things you can do to be certain your plugin won't throw any warnings or errors.

### Setting the proper peer dependencies

`gatsby` should be included under `peerDependencies` of your plugin and it should specify the proper versions of support.

```diff:title=package.json
{
  "peerDependencies": {
-   "gatsby": "^2.32.0",
+   "gatsby": "^3.0.0",
  }
}
```
