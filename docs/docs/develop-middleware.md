---
title: "Development Middleware"
---

Sometimes you need more granular access to the development server. For example, the [simple proxy config](/docs/api-proxy/) may not offer the flexibility needed for your development scenarios. Gatsby exposes the express app via a middleware function in `gatsby-config.js` where you can add any express middleware as needed.

```js
var proxy = require("http-proxy-middleware")

module.exports = {
  middleware: app => {
    app.use(
      "/.netlify/functions/",
      proxy({
        target: "http://localhost:9000",
        pathRewrite: {
          "/.netlify/functions/": "",
        },
      })
    )
  },
}
```

Keep in mind that `middleware` only has effect in development (with `gatsby develop`).
