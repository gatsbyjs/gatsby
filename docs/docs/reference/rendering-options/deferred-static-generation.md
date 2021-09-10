---
title: Deferred Static Generation API
---

Deferred Static Generation (DSG) allows you to defer non-critical page generation to user request, speeding up build times. Instead of generating _every_ page up-front you can decide to build certain pages up-front and others only when a user accesses the page.

## `createPage`

Add the `defer` key to the first argument of the [`createPage` action](/docs/reference/config-files/actions/#createPage) to mark a page as deferred or not. `defer` is optional, by default the page will be created through Static Site Generation (SSG).

```js
createPage({
  path: "/the-page-path/",
  component: require.resolve("./src/templates/template.js"),
  context: {},
  defer: true, // highlight-line
})
```

## TODO

For DSG the first request against a page is a cache miss because the HTML/JSON wasn't generated yet. On Gatsby Cloud the request is sent to a worker process that leverages an internal database to generate the data of the page. Once the page is generated it'll be sent back to the user immediately. In the background, all generated artifacts are stored so that on a second request the cached response is directly served from the CDN. For that it bypasses the worker process completely.

When you directly visit a page you'll get served the HTML. If you request a page on client-side navigation through Gatsby's Link component the response will be JSON. Gatsby's router uses this to render the page on the client. In the background, the JSON is stored and the HTML is generated so that on a second request of the page (including a direct visit) the page can be served from the CDN.

This all happens automatically and you only need to configure the `defer` key.

## Additional Resources

- [How to Use Deferred Static Generation](/docs/how-to/rendering-options/using-deferred-static-generation/)
- [Conceptual Guide](/docs/conceptual/rendering-options/)
