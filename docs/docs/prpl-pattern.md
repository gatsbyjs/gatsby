---
title: PRPL Pattern
---

i.e. why Gatsby is really fast.

https://developers.google.com/web/fundamentals/performance/prpl-pattern/

* **Push** critical resources for the initial URL route.
* **Render** initial route.
* **Pre-cache** remaining routes.
* **Lazy-load** and create remaining routes on demand.

* H/2 push is developing technology — not available on most hosts just
yet.

TODO fill out how Gatsby implements PRPL.

This issue from last fall is a good intro for now:

https://github.com/gatsbyjs/gatsby/issues/431
