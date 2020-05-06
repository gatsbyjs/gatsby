---
title: Migrating Remark to MDX
---

For people who already have an existing blog using gatsby-transformer-remark, but want to use MDX, you can swap out the remark transformer plugin with gatsby-plugin-mdx and touch little code otherwise.

## Adding in gatsby-plugin-mdx

Add gatsby-plugin-mdx (and its peer dependencies) to your package.json and remove gatsby-transformer-remark.

```shell
npm install @mdx-js/mdx @mdx-js/react gatsby-plugin-mdx
npm remove gatsby-transformer-remark
```

## Update gatsby-config.js

In your gatsby-config.js file, replace gatsby-transformer-remark with gatsby-plugin-mdx and update the plugins option with gatsbyRemarkPlugins:

```diff
{
- resolve: `gatsby-transformer-remark`
+ resolve: `gatsby-plugin-mdx`
  options: {
-   plugins: [
+   gatsbyRemarkPlugins: [
```

## Update gatsby-node.js

In the `createPages` API call, when you query for `allMarkdownRemark`, replace it with `allMdx`.

Also, update `onCreateNode` which creates the blog post slugs to watch for the node type of `Mdx` instead of `MarkdownRemark`.

## Update File Extension

Where your markdown files live, change the file extension to `.mdx`.

Also, you can tell `gatsby-plugin-mdx` to accept both `md` and `mdx` files by adding the `extensions` option in your gatsby-config entry.

```js
  {
    resolve: `gatsby-plugin-mdx`,
    options: {
      extensions: [`.md`, `.mdx`], // highlight-line
    },
  },
```

## Update usage in pages

Similar to gatsby-node, whenever you use `allMarkdownRemark` in a GraphQL query, change it to `allMdx`.

Then in your blogpost template, to render the MDX, pull in the `MDXRenderer` react component from `gatsby-plugin-mdx`.

```js
import { MDXRenderer } from "gatsby-plugin-mdx"
```

And in the graphql query, change the `html` field in `mdx` to `body`.

```graphql
mdx(fields: { slug: { eq: $slug } }) {
  id
  excerpt(pruneLength: 160)
  body
  frontmatter {
    ...
  }
}
```

And finally swap out the component with `dangerouslySetInnerHTML` to a `MDXRenderer` component:

```diff
const post = data.mdx

// ...

-<section dangerouslySetInnerHTML={{ __html: post.html }} />
+<MDXRenderer>{post.body}</MDXRenderer>
```

## What's next?

Go check out the [Importing and Using Components in MDX guide](/docs/mdx/importing-and-using-components) to find out how you can insert React components in your MDX files.
