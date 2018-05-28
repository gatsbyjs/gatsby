---
title: "Proxying API Requests in Development"
---

People often serve the front-end React app from the same host and port as their
backend implementation.

To tell the development server to proxy any unknown requests to your API server
in development, add a `proxy` field to your `gatsby-config.js`, for example:

```js
module.exports = {
  proxy: {
    prefix: "/api",
    url: "http://dev-mysite.com",
  },
};
```

This way, when you `fetch('/api/todos')` in development, the development server
will recognize that it’s not a static asset, and will proxy your request to
`http://dev-mysite.com/api/todos` as a fallback.

Keep in mind that `proxy` only has effect in development (with `gatsby develop`), and it is up to you to ensure that URLs like `/api/todos` point to
the right place in production.

## Advanced proxying

Sometimes you need more granular/flexible access to the develop server.
Gatsby exposes the [Express.js](https://expressjs.com/) develop server to your site's gatsby-config.js where you
can add Express middleware as needed.

```javascript
var proxy = require("http-proxy-middleware");

module.exports = {
  developMiddleware: app => {
    app.use(
      "/.netlify/functions/",
      proxy({
        target: "http://localhost:9000",
        pathRewrite: {
          "/.netlify/functions/": "",
        },
      })
    );
  },
};
```

Keep in mind that middleware only has effect in development (with gatsby develop).
