---
title: File System Route API
---

This page documents the APIs and conventions available with a file system based routing API, a suite of APIs and conventions to make the file system the primary way of creating pages. You should be able to accomplish most common tasks with this file-based API, if you want more control over the page creation you should use the [`createPages`](/docs/node-apis#createPages) API.

In short, these APIs enable you to programmatically create pages from Gatsby's [GraphQL data layer](/docs/graphql-concepts/) and to create [client-only routes](/docs/client-only-routes-and-user-authentication).

A complete example showcasing all options can be found in [Gatsby's "examples" folder](https://github.com/gatsbyjs/gatsby/tree/master/examples/route-api).

## Creating collection routes

Given the example that you source a `product.yaml` file and multiple markdown blog posts Gatsby will automatically infer the fields and create multiple [nodes](/docs/glossary#node) for both types (`Product` and `MarkdownRemark`). As usual, you can perform queries like `allProduct` or `allMarkdownRemark` but you're also able to access that information directly in the file path.

To do that, use curly braces (`{ }`) to signify dynamic URL segments that relate to a field within the node. Here are a few examples:

- `src/pages/products/{Product.name}.js => /products/burger`
- `src/pages/products/{Product.fields__sku}.js => /products/001923`
- `src/pages/blog/{MarkdownRemark.parent__(File)__name}.js => /blog/learning-gatsby`

Gatsby uses the content within the curly braces to generate GraphQL queries to retrieve the nodes that should be built for a given collection. This is the query that Gatsby uses to grab all the nodes and create a page for each of them. Gatsby also adds `id` to every query automatically to simplify how to integrate with page queries.

There are some general syntax requirements when using collection routes:

- Filenames must start and end with curly braces (`{ }`)
- Types must be capitalized (e.g. `MarkdownRemark` or `File`)
- The initial type name must be followed by a dot

Moreover, you cannot only name files but also folders with this syntax and create nested routes, for example:

- `src/pages/products/{Product.name}/{Product.color}.js => /products/fidget-spinner/red`
- `src/pages/products/{Product.name}/template.js =>`

### Dot notation

`src/pages/products/{Product.name}.js` generates the following query:

```graphql
allProduct {
  nodes {
    id # Gatsby always queries for id
    name
  }
}
```

Using `.` you signify that you want to access a field on a node of a type. To access nested fields you'll need to use the underscore notation.

### Underscore notation

`src/pages/products/{Product.fields__sku}.js` generates the following query:

```graphql
allProduct {
  nodes {
    id # Gatsby always queries for id
    fields {
      sku
    }
  }
}
```

Using `__` (double underscore) you signify that you want to access a nested field on a node.

You can nest as deep as necessary, e.g. `src/pages/products/{Product.fields__date__createdAt}.js` generates the following query:

```graphql
allProduct {
  nodes {
    id # Gatsby always queries for id
    fields {
      date {
        createdAt
      }
    }
  }
}
```

### Parentheses notation

`src/pages/blog/{MarkdownRemark.parent__(File)__name}.js` generates the following query:

```graphql
allMarkdownRemark {
  nodes {
    id # Gatsby always queries for id
    parent {
      … on File {
        name
      }
    }
  }
}
```

Using `( )` you signify that you want to access a [GraphQL union type](https://graphql.org/learn/schema/#union-types). This is often possible with types that Gatsby creates for you, e.g. `MarkdownRemark` always has `File` as a parent type and thus you can also access fields there. You can use this multiple levels deep, too, e.g. `src/pages/blog/{Post.parent__(MarkdownRemark)__parent__(File)__name}.js`.

### Component implementation

In the component itself (e.g. `src/pages/products/{Product.name}.js`) you're then able to access the `name` via `props` and as a variable in the GraphQL query (as `$name`). However, we recommend filtering by `id` as this is the fastest way to filter.

```jsx:title=src/pages/products/{Product.name}.js
import React from "react"
import { graphql } from "gatsby"

export default function Component(props) {
  return props.data.fields.sku + props.params.name
}

// This is the page query that connects the data to the actual component. Here you can query for any and all fields
// you need access to within your code. Again, since Gatsby always queries for `id` in the collection, you can use that
// to connect to this GraphQL query.

export const query = graphql`
  query ($id: String) {
    product(id: { eq: $id }) {
      fields {
        sku
      }
    }
  }
}
```

If you need to customize the query used for collecting the nodes you can use the `collectionGraphql` export, much akin to the `graphql` export. In the example below you filter out every product that is of type "Burger" for the collection route:

```jsx:title=src/pages/products/{Product.name}.js
import React from "react"
import { graphql, collectionGraphql } from "gatsby"

export default function Component(props) {
  return props.data.fields.sku + props.params.name
}

// If you are customizing the collection query, there is a special fragment you MUST use when using this API. The fragment converts to
// { nodes { id, [params_from_path] } }

export const collectionQuery = collectionGraphql`
{
  allProduct(filter: { type: { nin: ["Burger"] } }) {
    ...CollectionPagesQueryFragment
  }
}`

export const query = graphql`
  query ($id: String) {
    product(id: { eq: $id }) {
      fields {
        sku
      }
    }
  }
}
```

## Creating client-only routes

Use [client-only routes](/docs/client-only-routes-and-user-authentication) if you have dynamic data that does not live in Gatsby. This might be something like a user settings page, or some other dynamic content that isn't known to Gatsby at build time. In these situations, you will usually create a route with one or more dynamic segments to query data from a server in order to render your page.

For example, in order to edit a user, you might want a route like `/user/:id` to fetch the data for whatever `id` is passed into the URL. You can use square brackets (`[ ]`) in the file path to mark any dynamic segments of the URL.

- `src/pages/users/[id].js => /users/:id`
- `src/pages/users/[id]/group/[groupId].js => /users/:id/group/:groupId`

Gatsby also supports _splat_ routes, which are routes that will match _anything_ after the splat. These are less common, but still have use cases. As an example, suppose that you are rendering images from [S3](/docs/deploying-to-s3-cloudfront/) and the URL is actually the key to the asset in AWS. Here is how you might create your file:

- `src/pages/image/[...awsKey].js => /image/*awsKey`
- `src/pages/image/[...].js => /image/*`

Three periods `...` mark a page as a splat route. Optionally, you can name the splat as well, which has the benefit of naming the key of the property that your component receives. The dynamic segment of the file name (the part between the square brackets) will be filled in and provided to your components on a `props.params` object. For example:

```js:title=src/pages/users/[id].js
function UserPage(props) {
  const id = props.params.id
}
```

```js:title=src/pages/image/[...awsKey].js
function ProductsPage(props) {
  const splat = props.params.awsKey
}
```

```js:title=src/pages/image/[...].js
function AppPage(props) {
  const splat = props.params[‘*’]
}
```

## Routing and linking

Gatsby "slugifies" every route that gets created from collection pages. When you want to link to one of those pages, it may not always be clear how to construct the URL from scratch.

To address this issue, Gatsby automatically includes a `gatsbyPath` field on every type used by collection pages. The `gatsbyPath` field must take an argument of the `filePath` it is trying to resolve. This is necessary because it’s possible that one type is used in multiple collection pages.

There are some general syntax requirements when using the `filePath` argument:

- The path must be an absolute path (so starting with a `/`)
- You must omit the file extension
- You must omit the `src/pages` prefix
- Your path must not include `index`

### `gatsbyPath` example

Assume that a `Product` type is used in two pages:

- `src/pages/products/{Product.name}.js`
- `src/pages/discounts/{Product.name}.js`

If you wanted to link to the `products/{Product.name}` and `discounts/{Product.name}` routes from your home page, you would have a component like this:

```jsx:title=src/pages/index.js
import React from "react"
import { Link, graphql } from "gatsby"

export default function HomePage(props) {
  return (
    <ul>
      {props.data.allProduct.map(product => (
        <li key={product.name}>
          <Link to={product.productPath}>{product.name}</Link> (<Link to={product.discountPath}>Discount</Link>)
        </li>
      ))}
    </ul>
  )
}

export const query = graphql`
  query {
    allProduct {
      name
      productPath: gatsbyPath(filePath: "/products/{Product.name}")
      discountPath: gatsbyPath(filePath: "/discounts/{Product.name}")
    }
  }
}
```

By using [aliasing](/docs/graphql-reference/#aliasing) you can use `gatsbyPath` multiple times.

## Example use cases

Have a look at the [route-api example](https://github.com/gatsbyjs/gatsby/tree/master/examples/route-api/src/pages/products) for more detail.

### Collection route + fallback

By using a combination of a collection route with a client only route, you can create a great experience when a user tries to visit a URL from the collection route that doesn’t exist for the collection item. Consider these two file paths:

- `src/pages/products/{Product.name}.js`
- `src/pages/products/[name].js`

If the user visits a product that wasn’t built from the data in your site, they will hit the client-only route, which can be used to show the user that the product doesn’t exist or load the data on the client.

### Using one template for multiple routes

By placing the template/view for your routes into a reusable component you can display the same information under different routes. Take this example:

You want to display product information which is both accessible by name and SKU but has the same design. Create two file paths first:

- `src/pages/products/{Product.name}.js`
- `src/pages/products/{Product.meta__sku}.js`

Create a view component at `src/view/product-view.js` that takes in a `product` prop. Use that component in your collection route, e.g.:

```js:title=src/pages/products/{Product.name}.js
import React from "react"
import { graphql } from "gatsby"
import ProductView from "../../views/product-view"

function Product(props) {
  const { product } = props.data
  return <ProductView product={product} />
}

export default Product

export const query = graphql`
  query($id: String!) {
    product(id: { eq: $id }) {
      name
      description
      appearance
      meta {
        createdAt
        id
        sku
      }
    }
  }
`
```

### Purely client-only app

If you want your Gatsby app to be 100% client-only you can create a file at `src/pages/[...].js` to catch all requests. See the [client-only-paths example](https://github.com/gatsbyjs/gatsby/tree/master/examples/client-only-paths) for more detail.
