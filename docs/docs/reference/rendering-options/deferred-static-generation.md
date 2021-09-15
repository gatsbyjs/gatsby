---
title: Deferred Static Generation API
---

> **Note:** this feature requires running NodeJS server.
> It is currently fully supported with [`gatsby serve`](/docs/reference/gatsby-cli/#serve) and in [Gatsby Cloud](/products/cloud/).

Deferred Static Generation (DSG) allows you to defer non-critical page generation to the first user request, speeding up build times.
Instead of generating _every_ page up-front you can decide to build certain pages up-front and others only when a user accesses the page for the first time.
Subsequent page requests use the same HTML and JSON generated during the very first request to this page.

## Creating deferred pages

Creating deferred pages is almost identical to [creating regular pages](/docs/reference/routing/creating-routes/#using-gatsby-nodejs).
The only difference is the new `defer` argument for [`createPage` action](/docs/reference/config-files/actions/#createPage).
When set to `true` it excludes the page from the build step and instead generates it during the first HTTP request:

```js:title=gatsby-node.js
exports.createPages = async function ({ actions, graphql }) {
  actions.createPage({
    path: "/the-page-path/",
    component: require.resolve("./src/templates/template.js"),
    context: {},
    defer: true, // highlight-line
  })
}
```

`defer` is optional, by default the page will be generated at build-time.

## Working with deferred pages locally

Deferred static generation has no effect when using `gatsby develop`. You can work with them locally as usual.

If you want to test deferred generation specifically - run [`gatsby build`](/docs/reference/gatsby-cli/#build)
and [`gatsby serve`](/docs/reference/gatsby-cli/#serve). Deferred pages will be
generated during the very first request to the page via `gatsby serve`.

## Using in production

Deferred static generation requires a running NodeJS server. You can put NodeJS running `gatsby serve`
behind a CDN, however it requires additional infrastructure: monitoring, logging, crash-recovery, etc.

Complete setup is available for you in [Gatsby Cloud](/products/cloud/) out-of-the-box.

## How it works

The first request against a deferred page is a cache miss because the HTML/JSON wasn't generated yet. On Gatsby Cloud the request is sent to a worker process that leverages an internal database to generate the data of the page. Once the page is generated it'll be sent back to the user immediately. In the background, all generated artifacts are stored so that on a second request the cached response is directly served from the CDN. For that it bypasses the worker process completely.

When you directly visit a page you'll get served the HTML. If you request a page on client-side navigation through Gatsby's Link component the response will be JSON. Gatsby's router uses this to render the page on the client. In the background, the JSON is stored and the HTML is generated so that on a second request of the page (including a direct visit) the page can be served from the CDN.

This all happens automatically and you only need to configure the `defer` key.

## Additional Resources

- [How to Use Deferred Static Generation](/docs/how-to/rendering-options/using-deferred-static-generation/)
- [Conceptual Guide](/docs/conceptual/rendering-options/)
