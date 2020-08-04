---
title: File System Based Page Creation Reference
---

This doc is a rough documentation of the new APIs and conventions usable with the new file-based page creation features.

For now, these features are marked as experimental and require a flag to utilize. Start gatsby with the following flag:

```
GATSBY_EXPERIMENTAL_ROUTING_APIS=1 gatsby develop
```

## Client Route Page Creating

Client only routes can be created by using `[ ]` in the filepath to mark any dynamic segments of the url. While gatsby creates predictable routes for static pages, the same expectations apply to client side routes. Here are some examples:

- `/src/pages/users/[id].js => /users/:id`
- `/src/pages/products/[...splat].js => /users/*splat`
- `/src/pages/app/[...].js => /app/*`

The dynamic segments of the url will be properly interpolated and provided to your components on props.params. For example:

```js
// /src/pages/users/[id].js
function UserPage(props) {
  const id = props.params.id
}
```

```js
// /src/pages/products/[...splat].js
function ProductsPage(props) {
  const splat = props.params.splat
}
```

```js
// /src/pages/app/[...].js
function AppPage(props) {
    const splat = props.params[‘*’]
}
```

## Collection Page Creating

Developers can create multiple pages from a Model based on the collection of nodes within it. To do that we use the `{ }` marker to signify dynamic url segments that relate to a field within the node. There is some special logic that can happen in here. Here are a few examples:

- `/src/pages/products/{Product.name}.js => /products/burger`
- `/src/pages/products/{Product.fields__sku}.js => /products/001923`
- `/src/pages/blog/{MarkdownRemark.parent__(File)__relativePath}.js => /blog/learning-gatsby`

We use the content within the `{}` to generate graphql queries to retrieve the nodes that should be built for a given collection. For example:

This path: `/src/pages/products/{Product.name}.js`
Generates this query:

```graphql
allProduct {
    nodes {
        id # We always query for id
        name
    }
}
```

This path: `/src/pages/products/{Product.fields__sku}.js`
Generates this query:

```graphql
allProduct {
    nodes {
        id # We always query for id
        fields {
            sku
        }
    }
}
```

This path: `/src/pages/blog/{MarkdownRemark.parent__(File)__relativePath}.js`
Generates this query:

```graphql
allMarkdownRemark {
    nodes {
        id # We always query for id
        parent {
            … on File {
                relativePath
            }
        }
    }
}
```

This is the query that we use to grab all the nodes and create a page for each of them. We also add id to every query automatically to simplify how to integrate with page queries.

## Component Implementation

Page components act the exact same now. Gatsby will create an instance of it for each node it finds in it’s querying. If a user needs to customize the query used for collecting the nodes, that can be done with a special export. Much akin to page queries. Here’s an example.

```jsx
// /src/pages/products/{Product.name}.js
import { unstable_collectionGraphql } from "gatsby"

export default function Component(props) {
  return props.data.fields.sku + props.params.name
}

// If you are customizing the collection query, we have a special fragment you MUST use when using this api. The fragment changes into
// { nodes { id, [params_from_path] } }
export const collectionQuery = unstable_collectionGraphql`
{
    allProduct(filter: { type: { nin: ["Burger"] } }) {
        ...CollectionPagesQueryFragment
    }
}`

// This is the page query that connects the data to the actual component. Here you can query for any and all fields
// you nened access to within your code. Again, since we always query for `id` in the collection, you can use that
// to connect to this graphql query.
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

## Routing & Linking

We slugify every route that is created from collection pages. When you want to link to one of those pages it might be hard to know how to construct the url from scratch. So we’ve automatically included a `path` field on every model that is used by Collection pages. The path field must take an argument of the filePath it is trying to resolve. This is necessary because it’s possible that one model is used in multiple collection pages. Here is an example of how this works.

Let’s assume that a Product model is used in two pages:

- `/src/pages/products/{Product.name}.js`
- `/src/pages/discounts/{Product.name}.js`

Now if you wanted to link to the `products/{Product:name}` route from your home page, you would have a component like this:

```jsx
// /src/pages/index.js
import { Link, graphql } from "gatsby"

export default function HomePage(props) {
  return props.data.allProducts.map(
    product => <Link to={product.path}>{product.name}</Link>
  );
}

export const query = graphql`
    query ($id: String) {
        allProducts {
            name
            path(filePath: "/products/{Product:name}")
        }
    }
}
```

## Some Cool Ideas

### Collection Route + Fallback

By using a combination of a collection route with a client only route, we are able to create a great experience when a user tries to visit a url from the collection route that doesn’t exist for the collection item. Let’s take these two file paths:

- `/src/pages/products/{Product.name}.js`
- `/src/pages/products/[name].js`

Now if the user visits a product that wasn’t built from the data in your site, they will hit the client only route, which can be used to show the user that the product doesn’t exist.
