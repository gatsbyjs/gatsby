# gatsby-codemods

A collection of codemod scripts for use with [JSCodeshift](https://github.com/facebook/jscodeshift) that help migrate to newer versions of Gatsby.

> **Note:** Codemods are designed to rewrite your project's files. Ensure you have a backup before going any further.

## Setup & Run

There are two ways to run codemods on this package.

### npx

```shell
npx gatsby-codemods <codemod-name> <filepath>
```

`filepath` is not required and will default to the directory you're currently in.

Note that you cannot pass additional flags to this command. It will automatically run the codemod against file extensions `js, jsx, ts, tsx` and ignore the `node_modules`, `.cache` and `public` directories of your project.

### JSCodeshift

1. Install JSCodeshift as a global module

```shell
npm install --global jscodeshift
```

2. Install this package

```shell
npm install gatsby-codemods
```

3. Run a transform from this package on your project

```shell
jscodeshift -t node_modules/gatsby-codemods/transforms/global-graphql-calls.js my-project
```

Note that jscodeshift tries to match the formatting of your existing code, but you may need to use a tool like [prettier](https://prettier.io/) to ensure consistency after running these codemods.

Structure of a jscodeshift call:

- `jscodeshift -t <codemod-script> <path>`
  - `codemod-script` - path to the transform file, see available scripts below
  - `path` - files or directory to transform, typically the path to your Gatsby project
  - use the `-d` option for a dry-run and use `-p` to print the output for comparison
  - use the `--extensions` option if your files have different extensions than `.js` (for example, `--extensions js,jsx`)
  - see all available [jscodeshift options](https://github.com/facebook/jscodeshift#usage-cli).

## Included scripts

### `sort-and-aggr-graphql`

Apply changes to the `sort` argument and aggregation's `field` argument as explained in the [RFC: Change to sort and aggregation fields API](https://github.com/gatsbyjs/gatsby/discussions/36242).

See the [Gatsby v4 to v5 migration guide for details on when to use this](https://gatsbyjs.com/docs/migrating-from-v4-to-v5/#graphql-schema-changes-to-sort-and-aggregation-fields).

```shell
npx gatsby-codemods sort-and-aggr-graphql <filepath>
```

Example result:

```diff
{
- allMarkdownRemark(sort: { fields: [frontmatter___date], order: DESC }) {
+ allMarkdownRemark(sort: { frontmatter: { date: DESC } }) {
    nodes {
      ...fields
    }
  }
}
```

### `global-graphql-calls`

Add a `graphql` import to modules that use the `graphql` tag function without an import. This was supported in Gatsby v1 and deprecated for Gatsby v2.

See the [Gatsby v1 to v2 migration guide for details on when to use this](https://gatsbyjs.com/docs/migrating-from-v1-to-v2/#import-graphql-from-gatsby).

```shell
npx gatsby-codemods global-graphql-calls <filepath>
```

Example result:

```diff
import React from "react"
+ import { graphql } from "gatsby"

export default ({ data }) => (
  <h1>{data.site.siteMetadata.title}</h1>
)

export const query = graphql`
  query {
    site {
      siteMetadata {
        title
      }
    }
  }
`
```

### `import-link`

Import `Link` from `gatsby` instead of `gatsby-link` and remove the `gatsby-link` import.

See the [Gatsby v1 to v2 migration guide for details on when to use this](https://gatsbyjs.com/docs/migrating-from-v1-to-v2/#import-link-from-gatsby).

```shell
npx gatsby-codemods import-link <filepath>
```

Example result:

```diff
- import Link from "gatsby-link"
+ import { Link } from "gatsby"

export default props => (
  <Link to="/">Home</Link>
)
```

### `navigate-calls`

Change the deprecated `navigateTo` method from `gatsby-link` to `navigate` from the `gatsby` module.

See the [Gatsby v1 to v2 migration guide for details on when to use this](https://gatsbyjs.com/docs/migrating-from-v1-to-v2/#change-navigateto-to-navigate).

```shell
npx gatsby-codemods navigate-calls <filepath>
```

Example result:

```diff
import React from "react"
- import { navigateTo } from "gatsby-link"
+ import { navigate } from "gatsby"

// Don't use navigate with an onClick btw :-)
// Generally just use the `<Link>` component.
export default props => (
-  <div onClick={() => navigateTo(`/`)}>Click to go to home</div>
+  <div onClick={() => navigate(`/`)}>Click to go to home</div>
)
```

### `rename-bound-action-creators`

Rename `boundActionCreators` to `actions`. `boundActionCreators` has been deprecated in Gatsby v2

Note: Run this codemod only against files that use `boundActionCreators` instead of running it against a whole directory.

See the [Gatsby v1 to v2 migration guide for details on when to use this](https://gatsbyjs.com/docs/migrating-from-v1-to-v2/#rename-boundactioncreators-to-actions).

```shell
npx gatsby-codemods rename-bound-action-creators <filepath>
```

Example result:

```diff
- exports.onCreateNode = ({ node, getNode, boundActionCreators }) => {
+ exports.onCreateNode = ({ node, getNode, actions }) => {
- const { createNodeField } = boundActionCreators
+ const { createNodeField } = actions
  if (node.internal.type === `MarkdownRemark`) {
    const slug = createFilePath({ node, getNode, basePath: `pages` })
    createNodeField({
      node,
      name: `slug`,
      value: slug,
    })
  }
}
```
