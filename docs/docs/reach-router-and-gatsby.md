---
title: "@reach/router and Gatsby"
---

This guide gives a peek under the hood of using `@reach/router` with Gatsby.

## Why do we use @reach/router?

The main reasons Gatsby uses `@reach/router` are:

1. Preloading. You can read more about preloading in the docs for the [Gatsby Link API](/docs/reference/built-in-components/gatsby-link/).
2. The [routing accessibility](https://reach.tech/router/accessibility) it provides.
3. It supports [server rendering](https://reach.tech/router/server-rendering) which helps Gatsby build routed files at build time.
4. It supports [scroll restoration](/docs/how-to/routing/scroll-restoration), which allows Gatsby to better control pages' scroll position.

With Gatsby, you will mostly be using the `<Link />` component provided by the `gatsby` package. The [`<Link />` API docs](/docs/reference/built-in-components/gatsby-link/) explain the relationship between `gatsby` `<Link />` and `@reach/router` `<Link />` very nicely:

> The component is a wrapper around @reach/router’s Link component that adds useful enhancements specific to Gatsby.

## Client and Server Routing 🤝

Besides using the [`<Link />` API](/docs/reference/built-in-components/gatsby-link/) for linking between pages Gatsby generates, you can define your own client-side routes. See the [client only paths example](https://github.com/gatsbyjs/gatsby/tree/master/examples/client-only-paths) on how to use `<Router />` from `@reach/router` to make client routes work seamlessly together with your server routes.

## Other resources

- [Reach Router docs](https://reach.tech/router)
- [Video about using @reach/router in a standalone project (not Gatsby)](https://www.youtube.com/watch?v=J1vsBrSUptA)
- Gatsby documentation on [scroll restoration](/docs/how-to/routing/scroll-restoration)
