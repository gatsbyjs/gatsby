---
title: Creating Pages from the File System
---

This page roughly documents the APIs and conventions available with the new file-based page creation features.

For now, these features are marked as experimental and require a flag to utilize. Start your Gatsby site locally with the following flag:

```shell
GATSBY_EXPERIMENTAL_ROUTING_APIS=1 gatsby develop
```

## Creating client-only routes

Use client-only routes if you have dynamic data that does not live in Gatsby. This might be something like a user settings page, or some other dynamic content that isn't known to Gatsby at build time. In these situations, you will usually create a route with one or more dynamic segments to query data from a server in order to render your page.

For example, in order to edit a user, you might want a route like `/user/:id` to fetch the data for whatever `id` is passed into the URL. You can now use square brackets (`[ ]`) in the file path to mark any dynamic segments of the URL.

- `/src/pages/users/[id].js => /users/:id`
- `/src/pages/users/[id]/group/[groupId].js => /users/:id/group/:groupId`

Gatsby also supports _splat_ routes, which are routes that will match _anything_ after the splat. These are less common, but still have use cases. As an example, suppose that you are rendering images from [S3](/docs/deploying-to-s3-cloudfront/) and the URL is actually the key to the asset in AWS. Here is how you might create your file:

- `/src/pages/image/[...awsKey].js => /users/*awsKey`
- `/src/pages/image/[...].js => /app/*`

Three periods `...` mark a page as a splat route. Optionally, you can name the splat as well, which has the benefit of naming the key of the property that your component receives. The dynamic segment of the file name (the part between the square brackets) will be filled in and provided to your components on a `props.params` object. For example:

```js:title=/src/pages/users/[id].js
function UserPage(props) {
  const id = props.params.id
}
```

```js:title=/src/pages/image/[...awsKey].js
function ProductsPage(props) {
  const splat = props.params.awsKey
}
```

```js:title=/src/pages/image/[...].js
function AppPage(props) {
  const splat = props.params[‘*’]
}
```

## Creating collection pages

Developers can create multiple pages from a model based on the collection of nodes within it. To do that, use curly braces (`{ }`) to signify dynamic URL segments that relate to a field within the node. There is some special logic that can happen in here. Here are a few examples:

- `/src/pages/products/{Product.name}.js => /products/burger`
- `/src/pages/products/{Product.fields__sku}.js => /products/001923`
- `/src/pages/blog/{MarkdownRemark.parent__(File)__relativePath}.js => /blog/learning-gatsby`

Gatsby uses the content within the curly braces to generate GraphQL queries to retrieve the nodes that should be built for a given collection. For example:

`/src/pages/products/{Product.name}.js` generates the following query:

```graphql
allProduct {
  nodes {
    id # Gatsby always queries for id
    name
  }
}
```

`/src/pages/products/{Product.fields__sku}.js` generates the following query:

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

`/src/pages/blog/{MarkdownRemark.parent__(File)__relativePath}.js` generates the following query:

```graphql
allMarkdownRemark {
  nodes {
    id # Gatsby always queries for id
    parent {
      … on File {
        relativePath
      }
    }
  }
}
```

This is the query that Gatsby uses to grab all the nodes and create a page for each of them. Gatsby also adds `id` to every query automatically to simplify how to integrate with page queries.

## Component implementation

Page components act the exact same way. Gatsby will create an instance of it for each node it finds in it’s querying. If a user needs to customize the query used for collecting the nodes, that can be done with a special export. Much akin to page queries. Here’s an example.

```jsx:title=/src/pages/products/{Product.name}.js
import { unstable_collectionGraphql } from "gatsby"

export default function Component(props) {
  return props.data.fields.sku + props.params.name
}

// If you are customizing the collection query, there is a special fragment you MUST use when using this API. The fragment converts to
// { nodes { id, [params_from_path] } }
export const collectionQuery = unstable_collectionGraphql`
{
  allProduct(filter: { type: { nin: ["Burger"] } }) {
    ...CollectionPagesQueryFragment
  }
}`

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

## Routing and linking

Gatsby "slugifies" every route that gets created from collection pages. When you want to link to one of those pages, it may not always be clear how to construct the URL from scratch.

To address this issue, Gatsby automatically includes a `gatsbyPath` field on every model used by collection pages. The `gatsbyPath` field must take an argument of the `filePath` it is trying to resolve. This is necessary because it’s possible that one model is used in multiple collection pages. Here is an example of how this works:

Assume that a `Product` model is used in two pages:

- `/src/pages/products/{Product.name}.js`
- `/src/pages/discounts/{Product.name}.js`

If you wanted to link to the `products/{Product.name}` route from your home page, you would have a component like this:

```jsx:title=/src/pages/index.js
import { Link, graphql } from "gatsby"

export default function HomePage(props) {
  return props.data.allProducts.map(
    product => <Link to={product.gatsbyPath}>{product.name}</Link>
  );
}

export const query = graphql`
  query {
    allProducts {
      name
      gatsbyPath(filePath: "/products/{Product.name}")
    }
  }
}
```

## Example use cases

### Collection route + fallback

By using a combination of a collection route with a client only route, you can create a great experience when a user tries to visit a URL from the collection route that doesn’t exist for the collection item. Consider these two file paths:

- `/src/pages/products/{Product.name}.js`
- `/src/pages/products/[name].js`

If the user visits a product that wasn’t built from the data in your site, they will hit the client-only route, which can be used to show the user that the product doesn’t exist.
