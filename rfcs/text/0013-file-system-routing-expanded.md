- Start Date: 2020-06-18
- RFC PR: https://github.com/gatsbyjs/gatsby/pull/24463

# Summary

The file system is the definitive way to create routes with the `src/pages` directory. Previously only standalone and static pages like `/about` could be created there. This proposal is to enable client routes and collection routes to be created from the filesystem as well. Common patterns like creating pages for each blog post or paginated index pages are much simpler and now you can easily see your sites routes by looking at your file system. Page components now have all the logic they need to query data, create routes, and render. This makes them very easy to reuse on multiple sites and distribute through Gatsby Themes.

# Basic example

- `/src/pages/products/{Product.name}.js`
- `/src/pages/users/[id].js`

The `{}` delimiter signifies a collection route. Where the first segment is the Model name, and the second segment is the field to use for the url part.
The `[]` delimiter signifies a client side route. This will create a page at `users/:id`

# Motivation

A core part of building a site is crafting the routing structure. What pages exist and how are they built. Gatsby v1 introduced a low-level API createPage to accomplish this task. While this API is very powerful and flexible, we've long wanted a higher-level API that helps developers create sites faster.

# Detailed design

Client only routes:

```js
// src/pages/past-order/[id].js

// id from the url, generates a url of `past-order/:id`, which when a user visits
// the field will be passed to the component here.
export default function PastOrder({ params }) {
  // if the user visits `/past-order/123`, then id here is `123`
  const id = params.id
}
```

Collection routes:

```js
// src/pages/product/{Product.name}.js
import { graphql } from "gatsby"

// data will be the values resolved from the query exported in this component.
export default Product = ({ data }) => JSON.stringify(data)

export const query = graphql`
  # $name is the interpolated value from the url/file name
  query Project($name: String) {
    # query for the product that matches this name
    product(name: { eq: $name }) {
      # this is the data that gets given to the component in this file
      id
      name
      sku
    }
  }
`
```

Collection routes are unique because they will generate `n` pages for the results of querying all nodes for the Model supplied by the routing structure.

# Adoption strategy

Users can adopt this on their own by manually migrating their gatsby-node.js use cases into the new unified routing file system approach.

Additionally, this pattern will work well with upcoming tooling improvements like recipes and Gatsby admin.

# How we teach this

This will heavily affect documentation. We have several articles guiding users to gatsby-node and how to use that. Those articles should become "advanced" mode docs and any of the uses cases solved by this API should be updated in the docs to use the file system APIs.

# Unresolved questions

Are there common use cases that this API does not support?

# Try it out!

We have a prerelease of this that you can test out. Install this:

```
yarn add gatsby@unifiedroutes-v2

// or

npm install gatsby@unifiedroutes-v2
```
