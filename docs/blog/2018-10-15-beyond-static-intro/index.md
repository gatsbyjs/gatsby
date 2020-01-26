---
title: "Beyond Static: Building Dynamic Apps with Gatsby"
date: 2018-10-15
author: Dustin Schau
image: images/dynamic.jpg
showImageInArticle: false
tags: ["apps"]
---

We hear it regularly. Gatsby is for static sites, Next.js (or similar) is for when your data changes regularly and/or you need an "app." This raises a question... what actually _is_ an app?

If this question interests you, consider attending [the upcoming webinar][webinar] where we'll focus on shedding some light on this very question as well as talk about how to build dynamic web apps with Gatsby.

Until then, I’d like to offer some brief teasers of some of the content we’ll be discussing during the webinar and some introductory information in _how_ Gatsby enables app development.

> My first impression of Gatsby is that it is more of a static site generator which I interpret as being aimed at content or marketing websites and not as focused on web apps. That is a complete assumption so please correct me if I am wrong.
>
> - [Triptcip][reddit-thread]

## What is an app?

It's surprisingly challenging to define what separates an app from a static site.

- Authentication?
- Reacting to remote data changes?
- A shopping cart?

It's surprisingly murky where that line is drawn and why exactly many seem to clearly delineate the two _separate_ concepts.

In fact, I contend that the line between these two concepts is extremely blurry. There isn't some magic percentage threshold that, when crossed, indicates that a static site is now an application. Nor is the inverse true, that an "app" is somehow static because some percentage of its content never or rarely changes.

From this perspective, it's fair to consider dynamic content as the key determinant between static sites and apps. The more dynamic content an application has, the more app-like that application feels. From this basis, Gatsby is an excellent choice because it enables dynamic functionality just as easily as it enables static site generation.

## How does Gatsby enable app functionality?

Gatsby is great for static sites and for truly maximizing performance, while also maintaining a great developer experience and enabling fast feature development with tools developers actually _want_ to use. React, GraphQL, headless CMSes, and the list goes on and on. We enable these, and more, in an easy-to-use package that gets blazing-fast performance, by _default_. It's possible you've heard us talk about these things before 😅 We've honed in on this message and initially focused on this core functionality of building static sites. However, that's only one side of the coin. Gatsby's flexibility and one of its **core** ideas enable building apps on top of this solid static base.

### Hydration

One of the central ideas of Gatsby is that we statically generate our HTML content--using React DOM server-side APIs. A less-often illustrated feature is that this static HTML content can then be _enhanced_ with client-side JavaScript via React hydration. The general approach is as follows:

1. Build and render static HTML, creating content and pages with data injected at build time
1. Invoke [ReactDOM.hydrate method][hydrate] to pick up just where we left our static HTML
1. Transfer rendering to the [React reconciler][reconciler]

_This process is spelled out in more detail in the ["Understanding React Hydration" guide](/docs/react-hydration)_

It's this last phase that bridges the gap between static sites and full-fledged applications. In this phase you can make data calls, authenticate users, and perform all the app-like functionality you desire.

It's really that easy.

## Use cases

Gatsby enables these hooks to deliver app-like functionality, just as it does for static site generation. However, it's not as clear when it makes sense to reach for something purely server rendered (Next.js, Nuxt, etc.) or a hybrid approach, like we offer in Gatsby. In the webinar, I'll go over a number of examples of various types of web apps, including e-commerce apps, apps which utilize authentication, and apps that connect to a remote data source (e.g. a GraphQL API), among others! You'll leave having a clear mental model of the types of apps that **you** can build with Gatsby.

## Wrap Up

If these briefly described topics and use cases sound interesting to you then please consider [signing up for the Webinar][webinar]. I can't wait to share some practical advice, excellent tooling, and a live demo to show you how you can #BuildWithGatsby in more ways than _just_ static. I hope to see you there!

[reddit-thread]: https://www.reddit.com/r/reactjs/comments/992n2r/next_vs_gatsby/?st=jn6cojmr&sh=1a53fac1
[webinar]: https://www.gatsbyjs.com/build-web-apps-webinar
[hydrate]: https://reactjs.org/docs/react-dom.html#hydrate
[reconciler]: https://reactjs.org/docs/reconciliation.html
