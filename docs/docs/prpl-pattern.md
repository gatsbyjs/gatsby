---
title: PRPL Pattern
---

PRPL is a web site architecture developed by Google for building websites and
apps that work exceptionally well on smartphones and other devices with
unreliable network connections.

https://developers.google.com/web/fundamentals/performance/prpl-pattern/

PRPL stands for:

* **Push** critical resources for the initial URL route using `<link preload>`
  and http/2.
* **Render** initial route.
* **Pre-cache** remaining routes.
* **Lazy-load** and create remaining routes on demand.

_**Note** http/2 push is a developing server technology and not available on
most hosts just yet._

Gatsby follows the PRPL architectural pattern. Gatsby sites _render_ a static
HTML version of the initial route and then load the code bundle for the page.
Then immediately starts _pre-caching_ resources for pages linked to from the
initial route. When a user clicks on a link, Gatsby creates the new page _on
demand_ on the client.

This issue written at the start of Gatsby's 1.0 work provides further background
on how Gatsby works to guarantee high performance.

https://github.com/gatsbyjs/gatsby/issues/431

This blog post also covers how we think about performance —
["Web Performance 101—also, why is Gatsby so fast?"](/blog/2017-09-13-why-is-gatsby-so-fast/)
