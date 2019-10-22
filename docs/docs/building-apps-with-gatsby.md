---
title: Building Apps with Gatsby
---

Gatsby is an excellent framework for building web apps. You can use Gatsby to create personalized, logged-in experiences with two different approaches.

1.  "hybrid" app pages, and
2.  client-only routes & user authentication

## Hybrid app pages

When a visitor lands on a Gatsby page, the page's HTML file is loaded first, then the JavaScript bundle; When your React components load in the browser, they can fetch and render data from APIs.

> 💡 The [React docs](https://reactjs.org/docs/faq-ajax.html) have a great, straightforward example demonstrating this approach.

Some examples of how you could apply this:

- A news site with live data like sports scores or the weather
- An e-commerce site with universal product pages and category pages, but also personalized recommendation sections

You can also use your React components to create interactive widgets e.g. allow a user to do searches or submit forms. Because Gatsby is just React, it's easy to blend static and interactive/dynamic models of building web sites.

## Client-only routes & user authentication

Often you want to create a site with client-only routes that are gated by authentication. For more on this approach, check out the reference guide on [client-only routes and authentication](/docs/client-only-routes-and-user-authentication/).
