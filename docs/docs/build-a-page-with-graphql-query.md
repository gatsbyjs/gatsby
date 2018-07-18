---
title: Build a page with a GraphQL query
---

Gatsby creates pages from components located within `src/pages`. It watches the folder and will create and remove pages as you add and remove components. The pathname for each page is derived from the name of the component. For example, `src/pages/about.js` would be located at `/about/` when published.


In this guide, you will learn how to perform a query of your site's metadata for the description to display on your homepage.

## Adding `description` to `siteMetadata`
The first step in displaying the description will be ensuring you have one to begin with.

Inside of `gatsby-config.js`:
```js
module.exports = {
  siteMetadata: {
    title: 'My Homepage',
    description: 'This is where I write my thoughts.'
  }
}
```

## Basic Index Page Markup

A simple index page (`src/pages/index.js`) can be marked up like so:
```js
import React from 'react'

const HomePage = () => {
  return (
    <div>
      Hello!
    </div>
  )
}

export default HomePage
```

## Adding the GraphQL Query
The first thing to do is import GraphQL from Gatsby. At the top of `index.js` add:
```diff
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

```diff
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

From [browsing GraphiQL](/docs/introducing-graphiql/), you'll find that one of the fields that you can query on is `site`, which in turn has its own `siteMetadata` fields that correspond to the data provided in `gatsby-config.js`.

Putting this together, the completed query looks like:

```diff
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

## Get Data into the `<HomePage />` Component
To start, update the `HomePage` component to destructure `data` from props.

The `data` prop contains the results of the GraphQL query, and matches the shape you would expect. With this in mind, the updated `HomePage` markup looks like:

```diff
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
