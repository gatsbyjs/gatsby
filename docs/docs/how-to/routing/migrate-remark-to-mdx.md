---
title: Migrating Remark to MDX
---

For people who already have an existing blog using `gatsby-transformer-remark` but want to use MDX, you can swap out the Remark transformer plugin with `gatsby-plugin-mdx` and touch little code otherwise.

## Prerequisites

- An existing Gatsby site that builds pages using `gatsby-transformer-remark` ([gatsby-starter-blog](https://github.com/gatsbyjs/gatsby-starter-blog) will be used as a reference in this guide)

## Adding in gatsby-plugin-mdx

Add the `gatsby-plugin-mdx` plugin (and its peer dependencies) to your `package.json` file and remove the `gatsby-transformer-remark` plugin.

```shell
npm install @mdx-js/react gatsby-plugin-mdx
npm remove gatsby-transformer-remark
```

## Replacing gatsby-transformer-remark with gatsby-plugin-mdx

In your `gatsby-config.js` file, replace `gatsby-transformer-remark` with `gatsby-plugin-mdx`. Most sub-plugins of `gatsby-transformer-remark` can still work with `gatsby-plugin-mdx` by updating the plugins option to `gatsbyRemarkPlugins`.

```diff:title=gatsby-config.js
{
- resolve: `gatsby-transformer-remark`
+ resolve: `gatsby-plugin-mdx`
  options: {
-   plugins: [
+   gatsbyRemarkPlugins: [
```

### Update file extensions

Where your Markdown files live, changing their individual file extensions from `.md` to `.mdx` will pick them up with the new configuration.

Alternatively, you can tell `gatsby-plugin-mdx` to accept both `.md` and `.mdx` files by adding the `extensions` option in your `gatsby-config.js` entry.

```js:title=gatsby-config.js
  {
    resolve: `gatsby-plugin-mdx`,
    options: {
      extensions: [`.md`, `.mdx`], // highlight-line
    },
  },
```

Now with this addition, `gatsby-plugin-mdx` will see files that end with both `.mdx` or `.md`.

## Update gatsby-node.js

In the `createPages` API call, when you query for `allMarkdownRemark`, replace it with `allMdx` and also query for `internal.contentFilePath`.

```diff:title=gatsby-node.js
const result = await graphql(
  `
    {
-     allMarkdownRemark(
+     allMdx(
        sort: { frontmatter: { date: DESC }}
        limit: 1000
      ) {
        nodes {
          id
          fields {
            slug
          }
+         internal {
+           contentFilePath
+         }
        }
      }
    }
```

Don't forget to update the `posts` constant by replacing `allMarkdownRemark` with `allMdx`.

```diff:title=gatsby-node.js
-const posts = result.data.allMarkdownRemark.nodes
+const posts = result.data.allMdx.nodes
```

You'll need to update the `component` path passed to the `createPage` action to include the `internal.contentFilePath` as a query param:

```diff:title=gatsby-node.js
createPage({
  path: post.fields.slug,
- component: blogPost,
+ component: `${blogPost}?__contentFilePath=${post.internal.contentFilePath}`,
  context: {
```

Also, update `onCreateNode` which creates the blog post slugs to watch for the node type of `Mdx` instead of `MarkdownRemark`.

```diff:title=gatsby-node.js
exports.onCreateNode = ({ node, actions, getNode }) => {
  const { createNodeField } = actions

-  if (node.internal.type === `MarkdownRemark`) {
+  if (node.internal.type === `Mdx`) {
```

## Update usage in pages

Similar to `gatsby-node.js`, wherever you use `allMarkdownRemark`/`markdownRemark` in a GraphQL query, change it to `allMdx`/`mdx`.

Then in your blogpost template, to render the MDX, add a `children` prop to your page template.

```diff:title=src/templates/blog-post.js
-const BlogPostTemplate = ({ data, location }) => {
+const BlogPostTemplate = ({ data, location, children }) => {
```

And in the GraphQL query, remove the `html` field.

```graphql:title=src/templates/blog-post.js
mdx(id: { eq: $id }) {
  id
  excerpt(pruneLength: 160)
  frontmatter {
    # ...
  }
}
```

And finally swap out the component with `dangerouslySetInnerHTML` to just render the `children`:

```diff:title=src/templates/blog-post.js
-<section dangerouslySetInnerHTML={{ __html: post.html }} itemProp="articleBody" />
+<section itemProp="articleBody">{children}</section>
```

## Update Markdown files that include HTML code

As MDX uses [JSX](/docs/glossary/jsx/) instead of HTML, examine anywhere you put in HTML and make sure that it is valid JSX. There might be some reserved words that need to be modified, or attributes to convert to camelCase.

For instance, any HTML component with the `class` attribute needs to be changed to `className`.

```diff
-<span class="highlight">Hello World</span>
+<span className="highlight">Hello World</span>
```

## Additional resources

- [Adding MDX pages](/docs/how-to/routing/mdx)
- [gatsby-plugin-mdx README](/plugins/gatsby-plugin-mdx)
