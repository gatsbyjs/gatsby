---
title: Routing
---

Function routing shares the same syntax as [page routing](/docs/reference/routing/file-system-route-api/).

## Static Routing

Both top-level and nested routes are supported.

- `src/api/top-level.js` => `/api/top-level`
- `src/api/directory/foo.js` => `/api/directory/foo`

`index.js` files are routed at their directory path e.g. `src/api/users/index.js` => `/api/users`

## Dynamic Routing

### Param routes

Use square brackets (`[ ]`) in the file path to mark dynamic segments of the URL.

So to create an Function for fetching user information by `userId`:

```js:title=src/api/users/[id].js
export default async function handler(req, res) {
  const userId = req.params.id

  // Fetch user
  const user = await getUser(userId)

  res.json(user)
}
```

Dynamic routes share syntax with [client-only routes](/docs/reference/routing/file-system-route-api/#creating-client-only-routes).

### Splat or wildcard routes

Gatsby also supports splat (or wildcard) routes, which are routes that will match anything after the splat. These are less common, but still have use cases.

```js:title=src/api/foo/[...].js
export default function handler(req, res) {
  const params = req.params[`0`].split(`/`)

  // `src/api/foo/1/2 // params[0] === `1`
  // params[1] === `2`
}
```
