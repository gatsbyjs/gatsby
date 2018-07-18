---
title: Build a page with a GraphQL query
---

Gatsby will create a page for every component located in `src/pages`, with the index (or home) page located at `src/pages/index.js`.

In this example, we will query our site metadata for the description in order to display it on our homepage.

## Adding `description` to `siteMetadata`
The first step in displaying the description will be ensuring we have one to begin with.

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

Below our `HomePage` component declaration, we are going to export a new constant called `query`, and set its value to be a `graphql` [tagged template](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals) with our query between two backticks:

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

The first part of writing our GraphQL query is including the operation (in this case "`query`") and a name.

From [browsing GraphiQL](introducting-graphiql/), we can see that one of the fields we can query on is `site`, which in turn has its own `siteMetadata` fields that correspond to the data we provided in `gatsby-config.js`.

Putting this together, our completed query looks like:

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
To start, we'll update our `HomePage` component to destructure `data` from props.

The `data` prop contains the results of our GraphQL query, and matches the shape we would expect. With this in mind, our updated `HomePage` markup looks like:

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

After restarting `gatsby develop`, our home page will now display "This is where I write my thoughts." from the description we set in `gatsby-config.js`!
