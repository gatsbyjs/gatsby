---
title: Adding MDX Pages
examples:
  - label: Using MDX
    href: "https://github.com/gatsbyjs/gatsby/tree/master/examples/using-mdx"
---

## Introduction

[MDX](https://mdxjs.com/) is Markdown for the component era. It lets you write JSX embedded inside Markdown. This combination allows you to use Markdown’s terse syntax (such as `# Heading`) for your content and JSX for more advanced or reusable components.

This is useful in content-driven sites where you want the ability to introduce components like charts or alerts without having to configure a plugin. MDX also shines in interactive blog posts, documenting design systems, or long form articles with immersive or dynamic interactions.

## Prerequisites

- A Gatsby project set up with `gatsby@4.21.0` or later.

## Installation and configuration

If you already have a Gatsby site that you'd like to add MDX to, you can follow these steps for configuring the [gatsby-plugin-mdx](/plugins/gatsby-plugin-mdx/) plugin.

> **Starting a new project?** Skip the setup and create a new project using `npm init gatsby`
>
> Choose the option "Add Markdown and MDX support" to add the necessary MDX dependencies.
>
> **Already using Remark?** Check out the How-To Guide on [Migrating from Remark to MDX](/docs/how-to/routing/migrate-remark-to-mdx).

1. Install the required dependencies:

   ```shell
   npm install gatsby-plugin-mdx gatsby-source-filesystem @mdx-js/react
   ```

1. Update your `gatsby-config.js` to use `gatsby-plugin-mdx` and `gatsby-source-filesystem`

   ```js:title=gatsby-config.js
   module.exports = {
     plugins: [
        // Your other plugins...
        `gatsby-plugin-mdx`,
        {
          resolve: `gatsby-source-filesystem`,
          options: {
            name: `pages`,
            path: `${__dirname}/src/pages`,
          },
        },
     ],
   }
   ```

1. Restart your local development server by running `gatsby develop`.

## Writing pages in MDX

After installing `gatsby-plugin-mdx`, MDX files located in the `src/pages` directory will automatically be turned into pages.

> `gatsby-plugin-mdx` looks for MDX files and automatically transpiles them so that Gatsby can render them. Make sure to parse these MDX files with `gatsby-source-filesystem`, otherwise they can't be located.

Pages are rendered at a URL that is constructed from the filesystem path inside `src/pages`. For example, an MDX file at `src/pages/awesome.mdx` will result in a page being rendered at `yoursite.com/awesome`.

Create a new `.mdx` file in the `src/pages` directory (e.g. `src/pages/chart-info.mdx`). You can use [Markdown syntax](/docs/reference/markdown-syntax) to add different HTML elements.

### Using frontmatter in MDX

By default, `gatsby-plugin-mdx` supports [frontmatter](/docs/how-to/routing/adding-markdown-pages/#frontmatter-for-metadata-in-markdown-files)
so you can define things like titles and paths to use in your GraphQL
queries. You can declare frontmatter at the beginning of your MDX document:

```mdx
---
title: Hello, world!
slug: /hello-world
date: 2019-01-29
---

# Hello, world!
```

You can then query for this frontmatter data with [GraphQL](/docs/conceptual/graphql-concepts/):

```graphql
query {
  allMdx {
    nodes {
      frontmatter {
        title
        slug
        date(formatString: "MMMM DD, YYYY")
      }
    }
  }
}
```

Frontmatter is also available in `props.pageContext.frontmatter` and
can be accessed in blocks of JSX in your MDX document:

```mdx
---
title: Building with Gatsby
author: Jay Gatsby
---

<h1>{props.pageContext.frontmatter.title}</h1>
<span>{props.pageContext.frontmatter.author}</span>

(Blog post content, components, etc.)
```

## Importing JSX components into MDX documents

MDX allows you to use React components alongside Markdown. You can import components from third-party libraries (like [`theme-ui`](https://theme-ui.com/components)) to take advantage of pre-built functionality like data visualizations, email signup forms, or call-to-action buttons. You can also import and reuse _your own_ React components and even other MDX documents.

To import a component, add a JavaScript `import` statement to your MDX file. Once you've imported a component, you can use it in the body of your MDX file the same way you'd normally use a React component:

```mdx
---
title: Importing Components Example
---

import { Message } from "theme-ui" // highlight-line

You can import your own components.

<Message>MDX gives you JSX in Markdown!</Message> // highlight-line
```

> **Note:** If you would like to include frontmatter metadata _and_ import components, the frontmatter needs to appear at the top of the file and then imports can follow.

## Importing MDX files into JSX components

You can also import MDX files into JSX components. For example, if you have a MDX file inside `src/content` that you want to include into a React component, you'll first need to make sure that `gatsby-plugin-mdx` can transpile that file. For this you have to point `gatsby-source-filesytem` to this folder:

```js:title=gatsby-config.js
module.exports = {
  plugins: [
    // Your other plugins...
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        name: `content`,
        path: `${__dirname}/src/content`,
      },
    },
  ],
}
```

Afterwards you'll be able to use the MDX file (the `.mdx` file extension in the import is necessary) like so:

```jsx:title=src/components/component.jsx
import * as React from "react"
// highlight-next-line
import SomeText from "../content/some-text.mdx"

const Component = () => (
  <main>
    {/* highlight-next-line */}
    <SomeText />
  </main>
)

export default Component
```

## Defining a layout

You can use regular [layout components](/docs/how-to/routing/layout-components/) to apply layout to your sub pages.

To inject them, you have several options:

1. Use the [`wrapPageElement` API](/docs/reference/config-files/gatsby-browser/#wrapPageElement) including its [SSR counterpart](/docs/reference/config-files/gatsby-ssr/#wrapPageElement).
1. Add an `export default Layout` statement to your MDX file, see [MDX documentation on Layout](https://mdxjs.com/docs/using-mdx/#layout).
1. When using the [`createPage` action](/docs/reference/config-files/actions/#createPage) to programatically create pages, you should use the following URI pattern for your page component: `your-layout-component.js?__contentFilePath=absolute-path-to-your-mdx-file.mdx`. To learn more about this, head to the [programmatically creating pages](#programmatically-creating-pages) section just below.

### Make components available globally as shortcodes

To avoid having to import the same component inside of every MDX document you author, you can add components to an `MDXProvider` to make them globally available in MDX pages. This pattern is sometimes referred to as **shortcodes**.

```jsx:title=src/components/layout.jsx
import React from "react"
// highlight-start
import { MDXProvider } from "@mdx-js/react"
import { Chart, Pullquote } from "./ui"
import { Message } from "theme-ui"
// highlight-end

const shortcodes = { Chart, Pullquote, Message } // highlight-line

export default function Layout({ children }) {
  return (
    <MDXProvider components={shortcodes}>{children}</MDXProvider> // highlight-line
  )
}
```

All MDX components passed into the `components` prop of the `MDXProvider` will be made available to MDX documents that are nested under the provider. You have multiple options on how to use this layout component in your site. Learn more in [the layout section of the `gatsby-plugin-mdx` README](/plugins/gatsby-plugin-mdx/#layouts).

Now, you can include components in your MDX without importing them:

```mdx
---
title: Shortcode Components Example
---

Now, if you want to include the Message component, it's available in all MDX documents!

<Message>MDX gives you JSX in Markdown!</Message> // highlight-line

The Chart is also available since it was passed into the MDXProvider:

<Chart /> // highlight-line
```

Because the `<Message />` and `<Chart />` components were passed into the provider, they are available for use in all MDX documents.

## Programmatically creating pages

Sometimes you want to be able to programmatically create pages using MDX content that lives at arbitrary locations outside of `src/pages` or in a remote CMS.

For instance, let's say you have a Gatsby website, and you want to add support for MDX so you can start your blog. The posts will live in `content/posts`. You can do this with the help of `gatsby-source-filesystem` and [`createPages`](/docs/reference/config-files/gatsby-node/#createPages) in `gatsby-node.js`.

### Source MDX pages from the filesystem

You'll need to use `gatsby-source-filesystem` and tell it to source "posts" from a folder called `content/posts` located in the project's root.

```js:title=gatsby-config.js
module.exports = {
  plugins: [
    `gatsby-plugin-mdx`,
    // Add a collection called "posts" that looks
    // for files in content/posts
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        name: `posts`,
        path: `${__dirname}/content/posts`,
      },
    },
  ],
}
```

You can read about [`gatsby-source-filesystem`](/plugins/gatsby-source-filesystem) if you'd like to learn more.

### Add MDX files

Before you can write any GraphQL queries and programmatically create
pages, you need to add some content.

Make a folder called `content/posts` and create two files in it called
`blog-1.mdx` and `blog-2.mdx`. You can do this on the command line in
a terminal by using the following commands from the root of your
project.

```shell
mkdir -p content/posts
touch content/posts/blog-{1,2}.mdx
```

> **Note**:
> `mkdir -p path/to/a/directory` will create every folder in the path if it does not exist.
>
> `touch <filename>` will create an empty file named `<filename>`. The brackets (`{}`) are an expansion which means you can create multiple files in one command.

Open up each of the files you just created and add some content.

```mdx:title=blog-1.mdx
---
title: Blog Post 1
slug: /blog-1
---

Trying out MDX
```

```mdx:title=blog-2.mdx
---
title: Blog Post 2
slug: /blog-2
---

Gatsby is the best
```

### Create pages from sourced MDX files

In order to create pages from the sourced MDX files, you need to construct a query that finds all MDX nodes and pulls out the `slug` field from the `frontmatter` you defined.

> **Note**: You can open up a GraphiQL console for query testing
> in your browser at `http://localhost:8000/___graphql`

```graphql
query {
  allMdx {
    nodes {
      id
      frontmatter {
        slug
      }
    }
  }
}
```

```js:title=gatsby-node.js
const path = require("path")

exports.createPages = async ({ graphql, actions, reporter }) => {
  const { createPage } = actions

  const result = await graphql(`
    query {
      allMdx {
        nodes {
          id
          frontmatter {
            slug
          }
          internal {
            contentFilePath
          }
        }
      }
    }
  `)

  if (result.errors) {
    reporter.panicOnBuild('Error loading MDX result', result.errors)
  }

  // Create blog post pages.
  const posts = result.data.allMdx.nodes

  // you'll call `createPage` for each result
  posts.forEach(node => {
    createPage({
      // As mentioned above you could also query something else like frontmatter.title above and use a helper function
      // like slugify to create a slug
      path: node.frontmatter.slug,
      // Provide the path to the MDX content file so webpack can pick it up and transform it into JSX
      component: node.internal.contentFilePath,
      // You can use the values in this context in
      // our page layout component
      context: { id: node.id },
    })
  })
}
```

For further reading, check out the [createPages](/docs/reference/config-files/gatsby-node/#createPages) API.

### Make a layout template for your posts

You can create a file called `post.jsx` in `src/templates` - this component will be rendered as the template for every post. Now, create a component that accepts your compiled MDX content via `children` and uses GraphQL `data` to show the title:

```jsx:title=src/templates/post.jsx
import React from "react"
import { graphql } from "gatsby"
import { MDXProvider } from "@mdx-js/react"
import { Link } from "gatsby"

const shortcodes = { Link } // Provide common components here

export default function PageTemplate({ data, children }) {
  return (
    <>
      <h1>{data.mdx.frontmatter.title}</h1>
      <MDXProvider components={shortcodes}>
        {children}
      </MDXProvider>
    </>
  )
}

export const query = graphql`
  query($id: String!) {
    mdx(id: { eq: $id }) {
      frontmatter {
        title
      }
    }
  }
`
```

Now you need to tell `gatsby-plugin-mdx` to use your `PageTemplate` component as layout for your post. To do this, you need to change the structure of the `component` URI in your `createPage` call:

From an absolute path to your component (e.g. `/absolute/path/to/layout-component.js`) to a path that contains a query parameter `__contentFilePath` (e.g. `/absolute/path/to/layout-component.js?__contentFilePath=/absolute/path/to/content.mdx`).

<Announcement>

**Please note:** While you can create your layout templates as [TypeScript files](/docs/how-to/custom-configuration/typescript/) (e.g. `post.tsx`) you can't actually use most TypeScript syntax. This is because the underlying [acorn](https://github.com/acornjs/acorn/tree/master/acorn/) parser only understands modern JS and JSX syntax.

However, you can import your TypeScript types from another file instead. In most cases this should then work — if you're still encountering an "Unexpected token" error, try removing TypeScript syntax piece by piece to see why it breaks.

</Announcement>

Change your `gatsby-node.js` as following:

```diff
const path = require("path")
+ const postTemplate = path.resolve(`./src/templates/post.jsx`)

// Rest of the createPages API...

createPage({
  path: node.frontmatter.slug,
-  component: node.internal.contentFilePath,
+  component: `${postTemplate}?__contentFilePath=${node.internal.contentFilePath}`,
  context: { id: node.id },
})
```

That's it, you're done. Run `gatsby develop` to see your posts wrapped with `post.jsx`.

## Adding additional fields to your GraphQL MDX nodes

To extend your GraphQL nodes, you can use the [`onCreateNode` API](/docs/reference/config-files/gatsby-node/#onCreateNode).

You can find examples in the [README of `gatsby-plugin-mdx`](/plugins/gatsby-plugin-mdx#extending-the-graphql-mdx-nodes).

## `gatsby-remark-*` and `remark` plugins

`gatsby-plugin-mdx` can also use `gatsby-remark-*` (e.g. `gatsby-remark-images`) and `remark` (e.g. `remark-gfm`) plugins. You can learn more about this in the [configuration section](/plugins/gatsby-plugin-mdx#configuration) of `gatsby-plugin-mdx`'s README.

## Additional Resources

- [gatsby-plugin-mdx README](/plugins/gatsby-plugin-mdx)
- [What is MDX](https://mdxjs.com/docs/what-is-mdx/)
- [Using MDX](https://mdxjs.com/docs/using-mdx/)
- [Troubleshooting MDX](https://mdxjs.com/docs/troubleshooting-mdx/)
