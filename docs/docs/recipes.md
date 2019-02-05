---
title: Recipes
---

<!-- Basic template for a Gatsby recipe:

## Task to accomplish.

1-2 sentences about it.
Relevant links out (tutorial, doc pages, plugin readmes, etc). -->

Craving a happy medium between doing the [full tutorial](/tutorial/) and crawling the [full docs](/docs/)? Here's a quick guiding reference for how to build things, Gatsby style.

## Table of Contents

- [Using Gatsby without Graphql](#using-gatsby-without-graphql)
- [Gatsby project structure](#gatsby-project-structure)
- [Using a starter](#using-a-starter)
- [Creating pages](#creating-pages)
- [Linking between pages](#linking-between-pages)
- [Styling](#styling)
- [Creating layouts](#creating-layouts)
- [Deploying](#deploying)
- [Querying data](#querying-data)
- [Sourcing data](#sourcing-data)
- [Transforming data](#transforming-data)

## Using Gatsby without GraphQL

You can use the node `createPages` API to pull unstructured data directly into Gatsby sites rather than through GraphQL and source plugins. This is a great choice for small sites, while GraphQL and source plugins can help save time with more complex sites.

- Learn how to pull unstructured data into Gatsby sites in [Using Gatsby without GraphQL](/docs/using-gatsby-without-graphql/)
- Learn when and how to use GraphQL and source plugins for more complex Gatsby sites in [Querying data with GraphQL](/docs/querying-with-graphql/)

## Gatsby project structure

Read the [Gatsby project structure](/docs/gatsby-project-structure/) guide for a tour of the folders and files you may see inside a Gatsby project.

## Using a starter

Starters are boilerplate Gatsby sites maintained officially, or by the community.

- Learn how to use the Gatsby CLI tool to use starters in [tutorial part one](/tutorial/part-one/#using-gatsby-starters)
- Browse the [Starter Library](/starters/)
- Check out Gatsby's [official default starter](https://github.com/gatsbyjs/gatsby-starter-default)

## Creating pages

You can create pages in Gatsby explicitly by defining React components in `src/pages/`, or programmatically by using the `createPages` API.

- Walk through creating a page by defining a React component in `src/pages` in [tutorial part one](/tutorial/part-one/#familiarizing-with-gatsby-pages)
- Walk through programmatically creating pages in [tutorial part seven](/tutorial/part-seven/)
- Check out the docs overview on [creating and modifying pages](/docs/creating-and-modifying-pages/)

## Linking between pages

Routing in Gatsby relies on the `<Link />` component, a wrapper around [@reach/router's Link component](https://reach.tech/router/api/Link).

- Walk through using Gatsby's `<Link />` component in [tutorial part one](/tutorial/part-one/#linking-between-pages)
- Learn more about how `<Link />` works [in the docs](/docs/gatsby-link/)

## Styling

There are so many ways to add styles to your website; Gatsby supports almost every possible option, through official and community plugins.

- Walk through adding global styles to an example site in [tutorial part two](/tutorial/part-two/#creating-global-styles)
  - More on global styles [with standard CSS files](/docs/creating-global-styles/#how-to-add-global-styles-in-gatsby-with-standard-css-files)
  - More on global styles with [CSS-in-JS](/docs/creating-global-styles/#how-to-add-global-styles-in-gatsby-using-css-in-js)
  - More on global styles [with CSS files and no layout component](/docs/creating-global-styles/#add-global-styles-with-css-files-and-no-layout-component)
- Use the CSS-in-JS library [Glamor](/docs/glamor/)
- Use the CSS-in-JS library [Styled Components](/docs/styled-components/)
- Use [CSS Modules](/tutorial/part-two/#css-modules)

## Creating layouts

To wrap pages with layouts, use normal React components.

- Walk through creating a layout component in [tutorial part three](/tutorial/part-three/#your-first-layout-component)
- Gatsby v1 approached layouts differently. If the context is helpful, learn about the [differences in v2](/blog/2018-06-08-life-after-layouts/)

## Deploying

Showtime.

- Walk through building and deploying an example site in [tutorial part one](/tutorial/part-one/#deploying-a-gatsby-site)
- Learn how to make sure your site is configured properly to be [searchable, shareable, and properly navigable](/docs/preparing-for-site-launch/)
- Learn about [performance optimization](/docs/performance/)
- Read about [other deployment related topics](/docs/deploying-and-hosting/)

## Querying data

In Gatsby, you access data through a query language called [GraphQL](https://graphql.org/).

- Walk through an example of how Gatsby's data layer [pulls data into components using GraphQL](/tutorial/part-four/#how-gatsbys-data-layer-uses-graphql-to-pull-data-into-components)
- Walk through [using Gatsby's `graphql` tag for page queries](/tutorial/part-five/#build-a-page-with-a-graphql-query)
- Read through a conceptual guide on [querying data with GraphQL in Gatsby](/docs/querying-with-graphql/)
- Learn more about the `graphql` tag -- [querying data in a Gatsby page](/docs/page-query/)
- Learn more about `<StaticQuery />` -- [querying data in (non-page) components](/docs/static-query/)

## Sourcing data

Data sourcing in Gatsby is plugin-driven; Source plugins fetch data from their source (e.g. the `gatsby-source-filesystem` plugin fetches data from the file system, the `gatsby-source-wordpress` plugin fetches data from the WordPress API, etc).

- Walk through an example using the `gatsby-source-filesystem` plugin in [tutorial part five](/tutorial/part-five/#source-plugins)
- Search available source plugins in the [Gatsby library](/plugins/?=source)
- Understand source plugins by building one in the [source plugin tutorial](/docs/source-plugin-tutorial/)

## Transforming data

Transforming data in Gatsby is also plugin-driven; Transformer plugins take data fetched using source plugins, and process it into something more usable (e.g. JSON into JavaScript objects, markdown to HTML, and more).

- Walk through an example using the `gatsby-transformer-remark` plugin to transform markdown files [tutorial part six](/tutorial/part-six/#transformer-plugins)
- Search available transformer plugins in the [Gatsby library](/plugins/?=transformer)
