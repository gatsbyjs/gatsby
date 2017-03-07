---
title: Gatsbygram Case Study
date: "2017-03-03"
author: "Kyle Mathews"
image: 'ui-and-code.png'
---

![Gatsbygram](ui-and-code.png)

[Gatsbygram](https://gatsbygram.gatsbyjs.org) is a clone of Instagram
that is the the first Gatsby 1.0 example site.

It's a clone of Instagram built with Gatsby 1.0 to show how
building websites with the React ecosystem, Gatsby's new GraphQL data
processing layer, and the principles of Progress Web App (PWA) design
delivers great user experiences.

## What is Gatsby

Gatsby is a JavaScript web framework that combines the fast performance
of static websites with the powerful abstractions, excellent tools, and
client capabilities of the web-app world.

### Gatsby is fast

Gatsby automatically optimizes your site for the modern web. Gatsbygram
loads *3x faster* than the real Instagram site.

I tested Gatsbygram vs. Instagram on webpagetest.org using a Moto G4 on
a simulated 3G network and the median [speed
index](https://sites.google.com/a/webpagetest.org/docs/using-webpagetest/metrics/speed-index)
score for the initial view for Gatsbygram was 2468 vs. 7301 for Instagram.

![gatsbygram vs. instagram filmstrip](gatsbygram-instagram.png)*Filmstrip of Gatsbygram (top)
and Instagram (bottom) loading on webpagetest.org*

The second view is even faster for Gatsbygram as it now loads the site
from its service worker.

![gatsbygram vs. instagram filmstrip repeat load](gatsbygram-instagram-repeat-load.png)*Filmstrip of a repeat view of Gatsbygram (top)
and Instagram (bottom) loading on webpagetest.org*

### Gasby is built for the next billion users

Gatsby leverages service workers to *cache* site assets so users on
slow connections don't wait for...

### Gatsby is simple

Gatsby combines React, Webpack, and an innovative declarative data
processing layer so you don't waste time with painful or time-consuming
configuration and data processing scripting.

Stop wasting time and build something.

## App structure

Gatsby uses standard React.js components for building websites. Under
the hood it uses the popular React Router for powering client route
navigation.

Gatsby sites use three types of components for page layout.

* *general layout components* for headers and footers and general site
structure
* *template components* for *types* of pages like blog posts or
documentation pages
* *React.js pages* for individual pages you build with React.js
components.

### Layout components

Each Gatsby site is required to have a top-level layout component at
`layouts/default.js`. This layout component is used on every page of
your site so can contain things like your header, footer, and default
page structure. It is also used as the "[app
shell](https://developers.google.com/web/updates/2015/11/app-shell)"
when loading your site from a service worker.

Gatsbygram's layout component is somewhat more complicated than most
sites as it has logic to switch between showing images when clicked in
either a modal on larger screens or on their own page on smaller
screens. You can [read this component on
Github](https://github.com/gatsbyjs/gatsby/blob/1.0/examples/gatsbygram/layouts/default.js).

You'll notice too that the default layout component is a handy place to
load various global items to your site. Gatsbygram's layout loads the
font used for the site, [Space
Mono](https://fonts.google.com/specimen/Space+Mono), by requiring its
[Typefaces](https://github.com/KyleAMathews/typefaces) package.

### Template components

Gatsby 1.0 allows you to create pages programatically. When doing so,
you are required to specify the *component* that will be used for that
page.

In the site's `gatsby-node.js`, we use the Gatsby lifecycle API
`createPages` to create a page for each image.

`createPages` is called with the *graphql* function. This function
allows us to run arbitrary queries against your sites *graphql schema*.
Think of it like your site has a built-in database you can run queries
against.

For Gatsbygram, as we want to create a detail page for every image post,
so we query the `Posts` data. This data comes from a JSON file, included
in the site's repo, that's created when scrapping an Instagram user page
(more on scrapping later).

Since each post already has its own unique ID, we query for that to use
for the image's URL.

The query to get `id` for each `Post` looks like:

```graphql
{
  allPosts(limit: 1000) {
    edges {
      node {
        id
      }
    }
  }
}
```

This gets returned to us as an array which we loop over creating an
array of `pages` then return to Gatsby.

```javascript
// Create image post pages.
const postPage = path.resolve(`pages/template-post-page.js`)
_.each(result.data.allPosts.edges, (edge) => {
  pages.push({
    path: slug(edge.node.id), // required
    component: postPage,
    context: {
      id: edge.node.id,
    },
  })
})

resolve(pages)
```

Each page is required to have a `path` as well as a template component.
The `context` is optional but is often necessary as data in `context` is
passed as GraphQL *variables* when running the GraphQL query for each
page for a template.

## Routing

layouts/default — wraps all routes inside.

gatsby-node.js — walkthrough

links use gatsby-link — clientside routing + preloads necessary
code/data for subsequent pages on non-sw pages

## Views

* front page
* Detail page (they share the post component)
* how the modal magic works

## Data

explain GraphQL & walk through two queries.

## Theming

Glamor — totally sweet css-in-js

## Offline caching

The data for the entire front page is generated from the following
GraphQL query:

```graphql
query allImages {
  allPosts {
    edges {
      node {
        username
        likes
        id
        text
        weeksAgo: time(difference: "weeks")
        image {
          children {
            ... on ImageSharp {
              small: responsiveSizes(maxWidth: 292) {
                src
                srcSet
              }
              big: responsiveSizes(maxWidth: 640) {
                src
                srcSet
              }
            }
          }
        }
      }
    }
  }
}
```

<div>
<video controls="controls" autoplay="true" loop="true">
  <source type="video/mp4" src="/gatsbygram.mp4"></source>
  <p>Your browser does not support the video element.</p>
</video>
</div>

