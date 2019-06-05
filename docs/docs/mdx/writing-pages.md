---
title: Writing Pages in MDX
---

After [installing](/docs/mdx/getting-started) the plugin, MDX files
written in `src/pages` will turn into pages.

Pages are rendered at a URL that is constructed from the filesystem
path inside `src/pages`. An MDX file at `src/pages/awesome.mdx` will
result in a page being rendered at `mysite.com/awesome`.

> The `gatsby-mdx` plugin looks for MDX files and automatically
> transpiles them so that Gatsby internals can render them.

## Using frontmatter in MDX

By default, gatsby-mdx supports [frontmatter](/docs/adding-markdown-pages/#frontmatter-for-metadata-in-markdown-files)
so you can define things like titles and paths to use in your GraphQL
queries. You can declare frontmatter at the beginning of your MDX document:

```markdown
---
title: Hello, world!
path: /hello-world
date: 2019-01-29
---

# Hello, world!
```

Which can then be [queried with GraphQL](/docs/querying-with-graphql/):

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

> **Note:** To query `Mdx` content, it must be included in the node system using a
> source like the `gatsby-source-filesystem` plugin first. Instructions for sourcing
> content from somewhere like your `/src/pages` directory can be found on the [plugin's README](/packages/gatsby-source-filesystem/).

Frontmatter is also availalbe in `props.pageContext.frontmatter` and
can be accessed in blocks of JSX in your MDX document:

```markdown
---
title: "Building with Gatsby"
author: "Jay Gatsby"
---

<h1>{props.pageContext.frontmatter.title}</h1>

<span>{props.pageContext.frontmatter.author}</span>

(Blog post content, components, etc.)
```

## Importing JSX components and MDX documents

Similarly to what you'd do in JSX, you can import and render components
with JSX. You can also import other MDX documents.

```markdown:title="src/pages/chart.mdx"
import { Chart } from "../components/chart"
import FAQ from "../content/faq.mdx"

# Here’s a chart

The chart is rendered inside our MDX document.

<Chart />

<FAQ />
```

The `<Chart />` component coming from a `.js` file would be written like any
other React component, while the `<FAQ />` component coming from an `.mdx`
file might look something like this:

<!-- prettier-ignore -->
```markdown:title="src/content/faq.mdx"
## Frequently Asked Questions

### Why Gatsby?

Gatsby delivers faster, more secure sites and apps from a variety of data 
sources

### Where do I start?

The documentation offers guides for all different skill levels, you can 
find more info at the Gatsby's [Quick Start page](https://www.gatsbyjs.org/docs/quick-start)

<!-- This default export overrides the default layout ensuring -->
<!--  that the FAQ component isn't wrapped by other elements -->
export default ({ children }) => (
  <>
    {children}
  </>
)
```

> **Note**: the default export concept used in this code block is explained in more detail
> in the docs below on [defining layouts](#defining-a-layout)

## Using JavaScript exports

MDX supports `export` syntax as well, which enables specific use cases like providing data
for queries and rendering or overriding the default layout on MDX documents. You
don't need to export MDX documents to import them in other files.

### Exporting page metadata

You can provide additional data about a given document by exporting.
`gatsby-mdx` will automatically add it to the GraphQL schema so you
can use the exported data in your queries and in rendering.

Data exported in MDX documents in this manner is also made available on the
variable name you've assigned it.

You can export variables, objects, or other data structures:

<!-- prettier-ignore -->
```markdown
export const metadata = {
  name: "World",
  path: "/world",
};

<span>Hello, {metadata.name}</span>

The span above will read: "Hello, World".

<!-- you can also use other variables or data structures -->
export const names = ["Abdullah", "Adam", "Alice", "Aida"]

<ul>{names.map(name => <li>{name}</li>)}</ul>
```

The fields `name` and `path` defined on `metadata` could now alternatively
be accessed on MDX nodes in other areas of your Gatsby project by a GraphQL
query like this (this query fetches all MDX nodes and the data exports
associated with them):

```graphql
query MdxExports {
  allMdx {
    nodes {
      exports {
        metadata {
          name
          path
        }
      }
    }
  }
}
```

### Defining a layout

If you have [provided a default layout](/packages/gatsby-mdx/?=mdx#default-layouts) in your `gatsby-config.js`
through the `gatsby-mdx` plugin's options, the exported component you define
from this file will replace the default.

```markdown:title="src/pages/layout-example.mdx"
import PurpleBorder from "../components/purple-border"

# This will have a purple border

export default PurpleBorder
```

The `<PurpleBorder />` component might look something like this, wrapping the MDX
document in a `<div>` with a 1px purple border:

```jsx:title="src/components/purple-border.js"
import React from "react"

const PurpleBorder = ({ children }) => (
  <div style={{ border: "1px solid rebeccapurple" }}>{children}</div>
)

export default PurpleBorder
```

## GraphQL Queries

You can fetch data to use in your MDX file by exporting a `pageQuery`
in the same way you would for a `.js` page. The queried data is passed
as a prop, and can be accessed inside any JSX block when writing in
MDX:

<!-- prettier-ignore -->
```markdown
import { graphql } from "gatsby"

# My Awesome Page

Here's a paragraph, followed by a paragraph with data!

<p>{props.data.site.siteMetadata.description}</p>

export const pageQuery = graphql`
  site {
    siteMetadata {
      description
    }
  }
`
```
