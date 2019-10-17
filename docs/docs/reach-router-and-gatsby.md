---
title: "@reach/router and Gatsby"
---

This guide gives a peek under the hood of using `@reach/router` with Gatsby.

## Why do we use @reach/router?

The main reasons Gatsby uses `@reach/router` are:

1. Preloading. You can read more about preloading in the docs for the [Gatsby Link API](https://www.gatsbyjs.org/docs/gatsby-link/). 
2. The [routing accessibility](https://reach.tech/router/accessibility) it provides.
3. It supports [server rendering](https://reach.tech/router/server-rendering) which helps Gatsby build routed files at build time.

## Client and Server Routing 🤝

Did you know that besides using the `<Link />` ([docs](https://www.gatsbyjs.org/docs/gatsby-link/)) api for declaring routes, you define your own client side routes? See this [example](https://github.com/gatsbyjs/gatsby/tree/master/examples/client-only-paths) on how to use `<Router />` from `@reach/router` to have server and client routes work seamlessly
together with your server routes.

## Other resources

- [Reach Router docs](https://reach.tech/router)
- [Video about using @reach/router in a standalone project (not Gatsby)](https://www.youtube.com/watch?v=J1vsBrSUptA).
