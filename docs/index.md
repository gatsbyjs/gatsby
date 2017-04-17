---
title: Gatsby
---

HERO: The React static site generator
  - Get started button
  - tagline : Performant static sites with React


Gatsby generates extremely fast static websites written with [React](https://facebook.github.io/react/). It combines the fast performance of static websites with the powerful abstractions, tools, and client capabilities of the React.js world. Gatsbygram is [2-3x faster](link to blog post) than Instagram.

## What is a static site?

The word "static" does not refer to user experience, but to how the site is served. All HTML for every route in a static site is generated at build time, whereas for non-static sites it is generated fresh every time a request is made. Any site could be a static site, but it is realistically only feasible when every visitor sees the same thing (if Facebook were a static site they would need to generate every route for every user every time any data changed). Static sites serve files, and therefore can be distributed very fast over a Content Delivery Network without a server.

## What makes Gatsby different?

  - In contrast to other static site generators:
    - Once Gatsby site loads the initial page, the remaining Javascript will be cached via Service Workers to take over routing on the client.
    - Data can be sourced from anywhere: markdown files, external APIs, content management systems... anywhere.
    - Routes can be programatically defined, whereas most static site generators rely on the file system to define routes.
  - In contrast to standard React web apps, it is pre-rendered and follows the [PRPL](https://developers.google.com/web/fundamentals/performance/prpl-pattern/) pattern.
