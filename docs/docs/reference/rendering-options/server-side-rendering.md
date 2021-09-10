---
title: Server-side Rendering API
---

Server-side Rendering (SSR) allows you to pre-render a page with data that is fetched when a user visits the page. The server generates the full HTML for a page on the server and serves it to the user. The API is focused on data fetching outside of the Gatsby data-layer.

## `getServerData`

Export an async function called `getServerData` from a page and it'll be pre-rendered on each request using the data returned by `getServerData`.

```js
export async function getServerData(context) {
  return {
    props: {}, // Will be passed to the page component as "serverData" prop
  }
}
```

The `context` parameter is an object with the following keys:

- `headers`: The headers sent to the page, e.g. cache-headers
- `method`: The request method `GET`
- `url`: The request URL
- `query`: An object representing the query string
- `params`: If you use [File System Route API](/docs/reference/routing/file-system-route-api/) the URL path gets passed in as `params`. For example, if your page is at `src/pages/{Product.name}.js` the `params` will be an object like `{ name: 'value' }`.

`getServerData` can return an object with two keys:

- `props` (optional): Object containing the data passed to `serverData` page prop. Should be a serializable object.
- `headers` (optional): Object containing `headers` that should be passed, e.g. cache-headers

```js
export async function getServerData(context) {
  return {
    props: {
      data: "Error",
    },
    headers: {
      status: 500,
    },
  }
}
```

### `serverData` Page Prop

The data you return from `getServerData` gets passed to the page component as `serverData` prop.

```js
import * as React from "react"

const Page = ({ serverData }) => {
  const { dogImage } = serverData

  // Use dogImage in your page...
}

export async function getServerData() {
  const res = await fetch(`https://a-dog-image.com/random`)
  const data = await res.json()

  return {
    props: {
      dogImage: data,
    },
  }
}

export default Page
```

## TODO

For SSR every request only runs on server-side and goes through Gatsby Cloud. On Gatsby Cloud the request is sent to a worker process that runs your `getServerData` function and returns HTML back to the user. By default every request is a cache miss and for caching you'll need to set custom cache-headers.

When you directly visit a page you'll get served the HTML. If you request a page on client-side navigation through Gatsby's Link component the response will be JSON. Gatsby's router uses this to render the page on the client.

This all happens automatically and you'll only need to define a `getServerData` function in your page. You can't export it from non-page files.

## Additional Resources

- [How to Use Server-side Rendering](/docs/how-to/rendering-options/using-server-side-rendering/)
- [Conceptual Guide](/docs/conceptual/rendering-options/)
