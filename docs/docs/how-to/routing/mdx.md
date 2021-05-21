---
title: Add components to content using MDX
examples:
  - label: Official Example
    href: "https://github.com/gatsbyjs/gatsby/tree/master/examples/using-MDX"
---

## Introduction

[MDX](https://mdxjs.com/) is Markdown for the component era. It lets you write JSX embedded inside Markdown. This combination allows you to use Markdown’s terse syntax (such as `# Heading`) for your content and JSX for more advanced or reusable components.

This is useful in content-driven sites where you want the ability to introduce components like charts or alerts without having to configure a plugin. MDX also shines in interactive blog posts, documenting design systems, or long form articles with immersive or dynamic interactions.

## Part 1: Getting Started with MDX

If you already have a Gatsby site that you'd like to add MDX to, you can follow these steps for configuring the [gatsby-plugin-mdx](/plugins/gatsby-plugin-mdx/) plugin.

> **Starting a new project?** Skip the setup and create a new project using the [MDX
> starter](https://github.com/gatsbyjs/gatsby-starter-mdx-basic):
>
> ```shell
> gatsby new my-mdx-starter https://github.com/gatsbyjs/gatsby-starter-mdx-basic
> ```

> **Already using Remark?** Check out the How-To Guide on [Migrating from Remark to MDX](/docs/how-to/routing/migrate-remark-to-mdx).

1. **Add `gatsby-plugin-mdx`** and MDX as dependencies

   ```shell
   npm install gatsby-plugin-mdx @mdx-js/mdx @mdx-js/react
   ```

   > **Note:** If you're upgrading from v0, additionally [check out the MDX migration guide](https://mdxjs.com/migrating/v1).

2. **Update your `gatsby-config.js`** to use `gatsby-plugin-mdx`

   ```javascript:title=gatsby-config.js
   module.exports = {
     plugins: [
       // ....
       `gatsby-plugin-mdx`,
     ],
   }
   ```

3. **Restart your local development server** by running `gatsby develop`.

<EggheadEmbed
  lessonLink="https://egghead.io/lessons/gatsby-set-up-a-gatsby-site-to-use-mdx-with-gatsby-plugin-mdx-with-a-default-layout"
  lessonTitle="Set up a Gatsby site to use MDX with gatsby-plugin-mdx with a default layout"
/>

## Part 2: Writing Pages in MDX

After installing `gatsby-plugin-mdx`, MDX files located in the `src/pages` directory will automatically be turned into pages.

Pages are rendered at a URL that is constructed from the filesystem path inside `src/pages`. For example, an MDX file at `src/pages/awesome.mdx` will result in a page being rendered at `yoursite.com/awesome`.

**Create a new `.mdx` file** in the `src/pages` directory. You can use [Markdown syntax](/docs/reference/markdown-syntax) to add different HTML elements.

### Using frontmatter in MDX

By default, `gatsby-plugin-mdx` supports [frontmatter](/docs/how-to/routing/adding-markdown-pages/#frontmatter-for-metadata-in-markdown-files)
so you can define things like titles and paths to use in your GraphQL
queries. You can declare frontmatter at the beginning of your MDX document:

```mdx
---
title: Hello, world!
path: /hello-world
date: 2019-01-29
---

# Hello, world!
```

You can then query for this frontmatter data with [GraphQL](/docs/conceptual/graphql-concepts/):

```graphql
query {
  allMdx {
    edges {
      node {
        frontmatter {
          title
          path
          date(formatString: "MMMM DD, YYYY")
        }
      }
    }
  }
}
```

> **Note:** To query `MDX` content, it must be included in the node system using a
> source like the `gatsby-source-filesystem` plugin first.
>
> Check out the How-To Guide: [How to Source Data from the Filesystem](/docs/how-to/sourcing-data/sourcing-from-the-filesystem/).

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

## Part 3: Importing JSX components and MDX documents

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

<EggheadEmbed
  lessonLink="https://egghead.io/lessons/gatsby-import-and-use-a-react-component-in-markdown-with-mdx"
  lessonTitle="Import and use a React component in Markdown with MDX"
/>

### Make components available globally as shortcodes

To avoid having to import the same component inside of every MDX document you author, you can add components to an `MDXProvider` to make them globally available in MDX pages. This pattern is sometimes referred to as shortcodes.

```js:title=src/components/layout.js
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

All MDX components passed into the `components` prop of the `MDXProvider` will be made available to MDX documents that are nested under the provider. The `MDXProvider` in this example is in a layout component that wraps all MDX pages, you can read about this pattern in [the layout section of the `gatsby-plugin-mdx` README](/plugins/gatsby-plugin-mdx/#default-layouts).

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

<EggheadEmbed
  lessonLink="https://egghead.io/lessons/gatsby-make-react-components-globally-available-as-shortcodes-in-mdx"
  lessonTitle="Make React components globally available as shortcodes in MDX"
/>

## Part 4: Making GraphQL queries in an MDX File

You can fetch data to use in your MDX file by exporting a `pageQuery`
in the same way you would for a `.js` page. The queried data is passed
as a prop, and can be accessed inside any JSX block when writing in
MDX:

<!-- prettier-ignore -->
```mdx
import { graphql } from "gatsby"

# My Awesome Page

Here's a paragraph, followed by a paragraph with data!

<p>{props.data.site.siteMetadata.description}</p>

export const pageQuery = graphql`
  query {
    site {
      siteMetadata {
        description
        title
      }
    }
  }
`
```

> Note: For now, this only works [if the `.mdx` file exporting the query is placed in
> `src/pages`](https://github.com/ChristopherBiscardi/gatsby-mdx/issues/187#issuecomment-437161966).
> Exporting GraphQL queries from `.mdx` files that are used for programmatic page creation in
> `gatsby-node.js` via `actions.createPage` [is not currently
> supported](https://github.com/ChristopherBiscardi/gatsby-mdx/issues/187#issuecomment-489005677).
