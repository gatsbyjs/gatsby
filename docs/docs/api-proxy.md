---
title: "Proxying API Requests in Development"
---

People often serve the front-end React app from the same host and port as their backend implementation.

To tell the development server to proxy any unknown requests to your API server in development, add a `proxy` field to your `gatsby-config.js`, for example:

```js
module.exports = {
  proxy: {
    prefix: '/api',
    url: 'http://dev-mysite.com/api/'
  }
}
```

This way, when you `fetch('/api/todos')` in development, the development server will recognize that it’s not a static asset, and will proxy your request to `http://dev-mysite.com/api/todos` as a fallback.

Keep in mind that `proxy` only has effect in development (with `gatsby develop`), and it is up to you to ensure that URLs like `/api/todos` point to the right place in production.
