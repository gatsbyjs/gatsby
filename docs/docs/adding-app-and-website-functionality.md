---
title: Adding App and Website Functionality
overview: true
---

Gatsby empowers developers and creators to make a diverse amount of websites. One may wish to add additional functionality to their site such as search, authentication, forms, comments, and plenty of others.

The distinction between apps and websites is blurry, as [Dustin Schau explains](/blog/2018-10-15-beyond-static-intro/):

<!-- change this to a PullQuote when PR #18822 is merged -->

"I contend that the line between these two concepts is extremely blurry. There isn’t some magic percentage threshold that, when crossed, indicates that a static site is now an application. Nor is the inverse true, that an “app” is somehow static because some percentage of its content never or rarely changes." -Dustin Schau

## Understanding different patterns

Gatsby offers flexibility in configuring how it is setup, providing sensible defaults and allowing you to tap into lower level APIs when you need. That means there are also different options for architecting how pages are created, when you fetch data, etc. These patterns can be combined and tweaked for specific use cases.

### Static only pages

Static files are output by running `gatsby build` from exported components in your `src/pages` folder or from pages created using the [`createPage` API](/docs/node-apis/#createPages), like is shown in this diagram:

![Simple Static Site diagram with pages created from Gatsby automatically and programmatically](./images/simple-static-site.png)

The diagram illustrates the 2 main methods for creating pages in your site:

1. Automatically through `src/pages`
2. Programmatically

_**Note**: plugins and themes can also implement the `createPage` API and create pages on your behalf_

### Hybrid app pages

### Client only routes

Offering sites with statically rendered assets in as performant a way as possible has always been a core focus of Gatsby, but that is only one side of the coin. In this section of the docs, you will find a showcase of guides and concepts on how to level up your site to include all the app-like features on top of the static base.

<GuideList slug={props.slug} />
