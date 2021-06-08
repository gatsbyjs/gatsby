---
title: Routing
---

Function routing shares the same syntax as [page routing](/docs/reference/routing/file-system-route-api/).

Both top-level and nested routes are supported.

- `src/api/top-level.js` => `/api/top-level`
- `src/api/directory/foo.js` => `/api/directory/foo`

`index.js` files are routed at their directory path e.g. `src/api/users/index.js` => `/api/users`
