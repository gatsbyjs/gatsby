# Welcome to Gatsby v4 alpha

We'll use this simple site to show different ways to use the new v4 features.

To test it on your gatsby site, please install `gatsby@alpha-9689ff`. You can choose three different rendering modes.

1. Static Site Generation (SSG): Gatsby's default static generation - build everything at build time.
2. Deferred static rendering (DSR): Similar to SSG - generated lazily on request
3. Server Side Rendering (SSR): Escape hatch - use data not in gatsby's datalayer to go full Server side rendering.

### DSR configuration

If you use [File System Route API](https://www.gatsbyjs.com/docs/reference/routing/file-system-route-api/), you can export a config object or synchronous function to configure DSR per path.

```js
/**
 * Example of DSR per path using fs Routes
 */
export function config({ params }) {
  return {
    dsr: params.slug !== "hello-world",
  }
}

/**
 * Example of DSR for all routes
 */
// export const config = {
//   dsr: true,
// }
```

file: "src/pages/blog/{MarkdownRemark.slug}.js"

When using the `createPage` api, you can set it as an extra config options:

```js
actions.createPage({
  path: `/posts/${node.slug}/`,
  component: path.resolve(`./src/pages/blog/{MarkdownRemark.slug}.js`),
  ownerNodeId: node.id,
  context: {
    id: node.id,
  },
  dsr: node.slug !== "hello-world",
})
```

file: "gatsby-node.js"

### SSR configuration

When a page has a `getServerData` export, you'll opt into SSR, and on every request the page is regenerated. You mostly want to use it when using [client side route syntax](https://www.gatsbyjs.com/docs/reference/routing/file-system-route-api/#syntax-client-only-routes).

```js
export async function getServerData({ params }) {
  const fetch = require("node-fetch")

  try {
    const res = await fetch(`https://graphql.us.fauna.com/graphql`, {
      method: "POST",
      headers: {
        Authorization: "Bearer " + "fnAEN44PLbAAQOAyLZVMZMIA5lnjjKW4BcukdcBN",
      },
      body: JSON.stringify({
        query: `
query findProduct($slug: String!) {
  findProductBySlug(slug: $slug) {
      name
      description
  }
}

    `,
        variables: { slug: params.slug },
      }),
    })

    const { data, errors } = await res.json()
    if (errors) {
      throw new Error("not found")
    }

    if (data) {
      return data.findProductBySlug
    }
  } catch (err) {
    throw new Error(`error: ${err.message}`)
  }
}
```

Inside your page component, you'll get a new prop `serverData`.

```js
export default function BlogPostTemplate({ serverData }) {
```

We're eager to hear your feedback on these APIs and what's missing.
