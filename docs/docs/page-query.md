---
title: Querying data in pages with GraphQL
---

Gatsby's `graphql` tag enables page components to retrieve data via GraphQL query.

In this guide, you will learn [how to use the `graphql` tag](/docs/page-query#add-the-graphql-query) in your pages, as well as go a little deeper into [how the `graphql` tag works](/docs/page-query#how-does-the-graphql-tag-work).

## How to use the `graphql` tag in pages

### Add `description` to `siteMetadata`

The first step in displaying the description will be ensuring you have one to begin with.

```js:title=gatsby-config.js
module.exports = {
  siteMetadata: {
    title: "My Homepage",
    description: "This is where I write my thoughts.",
  },
}
```

### Mark up basic index page

A simple index page (`src/pages/index.js`) can be marked up like so:

```jsx:title=src/pages/index.js
import React from "react"

const HomePage = () => {
  return <div>Hello!</div>
}

export default HomePage
```

### Add the `graphql` query

The first thing to do is import `graphql` from Gatsby. At the top of `index.js` add:

```diff:title=src/pages/index.js
import React from 'react'
+ import { graphql } from 'gatsby'

const HomePage = () => {
  return (
    <div>
      Hello!
    </div>
  )
}
```

Below our `HomePage` component declaration, export a new constant called `query`, and set its value to be a `graphql` [tagged template](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals) with the query between two backticks:

```diff:title=src/pages/index.js
const HomePage = () => {
  return (
    <div>
      Hello!
    </div>
  )
}

+ export const query = graphql`
+   # query will go here
+ `
```

The first part of writing the GraphQL query is including the operation (in this case "`query`") along with a name.

From [browsing GraphiQL](/tutorial/part-five/#introducing-graphiql/), you'll find that one of the fields that you can query on is `site`, which in turn has its own `siteMetadata` fields that correspond to the data provided in `gatsby-config.js`.

Putting this together, the completed query looks like:

```diff:title=src/pages/index.js
export const query = graphql`
- # query will go here
+  query HomePageQuery {
+    site {
+      siteMetadata {
+        description
+      }
+    }
+  }
`
```

### Provide data to the `<HomePage />` component

To start, update the `HomePage` component to destructure `data` from props.

The `data` prop contains the results of the GraphQL query, and matches the shape you would expect. With this in mind, the updated `HomePage` markup looks like:

```diff:title=src/pages/index.js
import React from 'react'
import { graphql } from 'gatsby'

- const HomePage = () => {
+ const HomePage = ({data}) => {
  return (
    <div>
-     Hello!
+     {data.site.siteMetadata.description}
    </div>
  )
}

export const query = graphql`
  query HomePageQuery {
    site {
      siteMetadata {
        description
      }
    }
  }
`

export default HomePage
```

After restarting `gatsby develop`, your home page will now display "This is where I write my thoughts." from the description set in `gatsby-config.js`!

## How does the `graphql` tag work?

`graphql` is a [tag function](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals#Tagged_template_literals). Behind the scenes Gatsby handles these tags in a particular way:

### The short answer

During the Gatsby build process, GraphQL queries are pulled out of the original source for parsing.

### The longer answer

The longer answer is a little more involved: Gatsby borrows a technique from
[Relay](https://facebook.github.io/relay/) that converts your source code into an [abstract syntax tree (AST)](https://en.wikipedia.org/wiki/Abstract_syntax_tree) during the build step. [`file-parser.js`](https://github.com/gatsbyjs/gatsby/blob/master/packages/gatsby/src/internal-plugins/query-runner/file-parser.js) and [`query-compiler.js`](https://github.com/gatsbyjs/gatsby/blob/master/packages/gatsby/src/internal-plugins/query-runner/query-compiler.js) pick out your `graphql`-tagged templates and effectively remove them from the original source code.

This means that the `graphql` tag isn’t executed the way that you might expect. For example, you cannot use [expression interpolation](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals#Expression_interpolation) with Gatsby's `graphql` tag.
