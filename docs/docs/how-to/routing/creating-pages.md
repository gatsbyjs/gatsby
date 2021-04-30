---
title: Creating Pages
---

There are multiple ways to create pages in Gatsby.

## Creating individual pages

The simplest way to create a page is to export a React component from a page located in the `src/pages` directory. For example, exporting a component from `src/pages/about.js` will create a route at `/about`. More details in the [Routing Reference](https://www.gatsbyjs.com/docs/reference/routing/creating-routes/#define-routes-in-srcpages)

## Collection Routing

Gatsby supports multiple templated pages based on a single component. For example, a file located at `src/pages/products/{Product.name}.js` can generate pages like `/products/burger`, based on information coming in from a CMS or other data source. For details, look at the [File System Route API](/docs/reference/routing/file-system-route-api) documentation.

## Creating pages from Markdown

In order to enable a better content composition experience, Gatsby allows you to create both individual pages and dynamic routes using either [Markdown files](https://www.gatsbyjs.com/docs/how-to/routing/adding-markdown-pages/) or [MDX files](https://www.gatsbyjs.com/docs/how-to/routing/mdx/).

## Using gatsby-node.js

If you need more fine-grained control over routing, you can programmatically create pages in `gatsby-node.js`. More details in the [Routing Reference](https://www.gatsbyjs.com/docs/reference/routing/creating-routes/#using-gatsby-nodejs)

## Authenticated routes

For pages dealing with sensitive information, Gatsby lets you create [client-only routes](https://www.gatsbyjs.com/docs/how-to/routing/client-only-routes-and-user-authentication) that live behind an authentication gate.
