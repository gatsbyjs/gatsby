---
title: Routing
---

## Creating routes

Gatsby makes it easy to programmatically control your pages. Pages can be created in three ways:

- In your site's gatsby-node.js by implementing the API
  [`createPages`](/docs/node-apis/#createPages)
- Gatsby core automatically turns React components in `src/pages` into pages
- Plugins can also implement `createPages` and create pages for you

See the [Creating and Modifying Pages](/docs/creating-and-modifying-pages) for more detail.

## Linking between routes

You can use `gatsby-link` to link to these routes -- this will provide almost-instantaneous page transitions via prefetching. [More on Gatsby Link](/docs/gatsby-link/).

You can also use standard `<a>` links, but you won't get the benefit of prefetching in this case.

## Creating authentication-gated links

If you don't want all of your content available on the public web, Gatsby lets you create [client-only routes](/docs/client-only-routes-and-user-authentication) that live behind an authentication gate.

<GuideList slug={props.slug} />
