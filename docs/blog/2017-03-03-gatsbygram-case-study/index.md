---
title: Gatsbygram Case Study
date: "2017-03-03"
author: "Kyle Mathews"
image: 'ui-and-code.png'
---

![Gatsbygram](ui-and-code.png)

[Gatsbygram](https://gatsbygram.gatsbyjs.org) is the first Gatsby 1.0
example site.

It's a clone of Instagram built with Gatsby 1.0 to show off the power
of the new GraphQL data processing layer and building with the React
ecosystem.

I built most of the site in one day with another day of tweaks and bug
fixes.

The entire site is built from:

* two page components—one for the front page and one for each image
page
* three other regular React components
* Two GraphQL queries
* Three open-source React components
* A handful of other JS libraries

Which adds up to something like 1000 lines of site code.

And... that's it! It's pretty remarkable to me how concise the code is.

And the site is lightning fast to use (loads almost 3x faster than the
real Instagram site) and works offline.

## App structure

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

