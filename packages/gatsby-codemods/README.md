## gatsby-codemods

A collection of codemod scripts for use with [JSCodeshift](https://github.com/facebook/jscodeshift) that help migrate to newer versions of Gatsby.

> **Note:** Codemods are designed to rewrite your project's files. Ensure you have a backup before going any further.

### Setup & Run

- Install JSCodeshift as a global module

```
npm install --global jscodeshift
```

- Install this package

```
npm install gatsby-codemods@next
```

- Run a transform from this package on your project

```
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

### Included scripts

#### `global-graphql-calls`

Add a `graphql` import to modules that use the `graphql` tag function without an import. This was supported in Gatsby v1 and deprecated for Gatsby v2.

See the [Gatsby v2 migration guide for details on when to use this](https://next.gatsbyjs.org/docs/migrating-from-v1-to-v2/#import-graphql-from-gatsby).

```sh
jscodeshift -t node_modules/gatsby-codemods/dist/transforms/global-graphql-calls.js <path>
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

### More scripts

Check out [issue 5038 in the Gatsby repo for additional codemod ideas](https://github.com/gatsbyjs/gatsby/issues/5038#issuecomment-411516865).

We'd love your help with writing these!
