---
title: Writing Pages in MDX
---

After [installing](/docs/mdx/getting-started) the plugin, MDX files
written in `src/pages` will turn into pages. This happens because
`gatsby-mdx` looks for MDX files and automatically transpiles them
so that Gatsby internals can render them.

Pages are rendered at a URL that is constructed from the filesystem
path inside `src/pages`. An MDX file at `src/pages/awesome.mdx` will
result in a page being rendered at `mysite.com/awesome`.

By default, gatsby-mdx supports frontmatter so you can define things
like titles and paths to use in your GraphQL queries.

## Frontmatter

You can declare frontmatter at the beginning of your MDX document:

```md
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
          path
          title
          date(formatString: "MMMM DD, YYYY")
        }
      }
    }
  }
}
```

## Importing components

Similarly to what you'd do in JSX, you can import and render components
with JSX. You can also import other MDX documents.

```md
import { Chart } from "../components/chart"
import FAQ from "../content/faq.mdx"

# Here’s a chart

The chart is rendered inside our MDX document.

<Chart />

<FAQ />
```

## Exports

MDX supports `export` syntax as well which allows you to export metadata
about a given document. gatsby-mdx will automatically add it to the
GraphQL schema so you can use the exported data in your queries and
rendering.

```mdx
export const metadata = {
  name: "World",
  path: "/world",
}

# Hello, <span>{props.metadata.name}</span>

The heading above will say "Hello, World".
```

### Defining a layout

You can specify the layout that will wrap your component using the
default export.

```md
import PurpleBorder from "../components/purple-border"

# This will have a purple border

export default PurpleBorder
```

## GraphQL Queries

You can fetch data to use in your MDX file by exporting a `pageQuery`
in the same way you would for a `.js` page. The queried data is passed
as a prop, and can be accessed inside any JSX block when writing in
MDX:

<!-- This is invalid JSX; prettier has a bug with this code snippet -->

```jsx
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
