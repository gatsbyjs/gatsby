---
title: Routing
---

API Functions shares the syntax as [filesystem routing](/docs/reference/routing/file-system-route-api/).

## Static Routes

Both top-level and nested routes are supported.

- `src/api/top-level.js` => `/api/top-level`
- `src/api/directory/foo.js` => `/api/directory/foo`

`index.js` files are routed at their directory path e.g. `src/api/users/index.js` => `/api/users`

## Dynamic Routing

### Param routes

Dynamic routes share syntax with [client-only routes](/docs/reference/routing/file-system-route-api/#creating-client-only-routes).

You can use square brackets ([ ]) in the file path to mark any dynamic segments of the URL.

So to create an API Function for fetching user information, create the following:

```ts:title=src/api/users/[id].ts
import { GatsbyAPIFunctionResponse, GatsbyAPIFunctionRequest } from "gatsby"

export default function contactFormHandler(
  req: GatsbyAPIFunctionRequest,
  res: GatsbyAPIFunctionResponse
) {
  const userId = req.params.id

  // Fetch user
  const user = getUser(userId)

  res.json(user)
}
```

### Splat or wildcard routes

Gatsby also supports splat (or wildcard) routes, which are routes that will match anything after the splat. These are less common, but still have use cases.

```ts:title=src/api/foo/[...].ts
import { GatsbyAPIFunctionResponse, GatsbyAPIFunctionRequest } from "gatsby"

export default function contactFormHandler(
  req: GatsbyAPIFunctionRequest,
  res: GatsbyAPIFunctionResponse
) {
  const params = req.params[`0`].split(`/`)

  // `src/api/foo/1/2
  // params[0] === `1`
  // params[1] === `2`
}
```
