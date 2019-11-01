---
title: Adding App and Website Functionality
overview: true
---

Gatsby empowers developers and creators to make a diverse amount of websites. One may wish to add additional functionality to their site such as search, authentication, forms, comments, and plenty of others.

The distinction between apps and websites is blurry, as [Dustin Schau explains](/blog/2018-10-15-beyond-static-intro/):

<!-- TODO change this to a PullQuote when PR #18822 is merged -->

"I contend that the line between these two concepts is extremely blurry. There isn’t some magic percentage threshold that, when crossed, indicates that a static site is now an application. Nor is the inverse true, that an “app” is somehow static because some percentage of its content never or rarely changes." -Dustin Schau

## How hydration makes apps possible

Even though Gatsby generates static files, Gatsby apps [rehydrate](/docs/glossary#hydration) from static HTML rendered by ReactDOM APIs into an app running client-side JavaScript. The general approach as outlined in the [React Hydration guide](/docs/react-hydration) is as follows:

1. Build and render static HTML, creating content and pages with data injected at build time
1. Invoke `ReactDOM.hydrate()` method to pick up just where the static HTML was left
1. Transfer rendering to the React reconciler

It's this last phase that bridges the gap between static sites and full-fledged applications. In this phase you can make calls for dynamic data, authenticate users, and perform all the app-like functionality you desire because the page is running a React application.

## Patterns for creating pages

There are different options for organizing how your pages are created and what they will be responsible for. These patterns can be combined and tweaked for specific use cases like to pull in data at [build time](/docs/glossary#build) for great performance, or call for data at [runtime](/docs/glossary#runtime) for a more dynamic experience.

Because all Gatsby pages are hydrated into React, **any of the following patterns are capable of app-like behavior**. This section is to help explain how people commonly think about Gatsby.

### Static pages

Static files are output by running `gatsby build` from exported components in your `src/pages` folder or from pages created using the [`createPage` API](/docs/node-apis/#createPages), like is shown in this diagram:

![Simple Static Site diagram with pages created from Gatsby automatically and programmatically](./images/simple-static-site.png)

The diagram illustrates the 2 main methods for creating pages in your site:

1. Automatically through `src/pages`
2. Programmatically with the `createPage` API

_**Note**: plugins and themes can also implement the `createPage` API and create pages on your behalf_

Content that is solely static can be rendered in this manner, with one example being by looping through markdown files in your filesystem and creating a page for each.

### Hybrid app pages

### Client only routes

Offering sites with statically rendered assets in as performant a way as possible has always been a core focus of Gatsby, but that is only one side of the coin. In this section of the docs, you will find a showcase of guides and concepts on how to level up your site to include all the app-like features on top of the static base.

<GuideList slug={props.slug} />
