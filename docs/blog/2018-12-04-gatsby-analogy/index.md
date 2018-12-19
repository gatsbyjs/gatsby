---
title: 5 analogies that explain what Gatsby can do for you
date: 2018-12-04
author: Amberley Romo
tags:
  - gatsby concepts
---

Gatsby does an incredible amount of cool stuff for you, automatically. This makes Gatsby an incredibly powerful, versatile tool. However, this broad depth of functionality can make it difficult to explain what Gatsby does in a concise and approachable way.

In this post, I'll aim for the latter -- an approachable explanation of what Gatsby does using a series of analogies that others have found helpful. I hope you do, too!

1. Start off with a pre-configured development environment and build process (high-performance car)
2. Benefit from built-in performance optimization (Neo’s Matrix skills)
3. Leverage static site delivery and web app experience (Compressed mattress)
4. Prefetch resources for snappy routing (Psychic delivery person)
5. Consolidate data sourcing and transformations (Amazon)

## 1. Start off with a pre-configured development environment and build process

Gatsby uses [React](https://reactjs.org/) for its UI layer. It can be notoriously difficult for newcomers to get started with React, or even for experienced React devs to configure a new React project from the ground up every time. (See: [Javascript Fatigue](https://medium.com/@ericclemmons/javascript-fatigue-48d4011b6fc4)).

Is it possible to learn every fine-grained detail to optimize a development environment and build process for React? Sure. Is it necessary to get up and going on a project? No, not anymore.

I relate it to driving a high-performance car. Do I need to understand the inner workings and build process of a high-performance car (to an implementation-level depth) in order to drive one? Definitely not. I just need to know how to drive the car!

**You just drive the car; you just start building your UI.**

## 2. Benefit from built-in performance optimization

Performance optimization is a first-class concern for Gatsby. When you create a Gatsby site, you automatically enjoy performance benefits, without having to make any other considerations.

One question I hear sometimes is, “What does Gatsby do that I couldn’t do myself?” The basic answer, technically, is nothing. Here’s the caveat.

Take Neo in the Matrix. (If you haven’t seen The Matrix, I’ll give enough context). In the movie, there’s a part where the character Neo has skills uploaded directly into his brain. When he wakes up, he utters, “I know kung fu”.

![Neo knows kung fu](./images/neo-kung-fu.gif)

Neo could have spent 10,000 hours mastering the martial art. But instead, thanks to sci-fi software magic, it was instantly uploaded into his brain.

Similarly, you could spend 10,000 hours becoming a kung fu master in performance optimization (and you should, if you want to!). But with Gatsby, you can generate a project, and start off pre-optimized. (A Neo-esque head start.)

**Neo instantly downloads kung fu; you instantly download a head start on web performance and optimization.**

## 3. Leverage static site delivery and web app experience

In [Gatsby for apps](/blog/2018-11-07-gatsby-for-apps/), we recently explained:

<pullquote citation="Dustin Schau">
  Gatsby is great for building web experiences that leverage the benefits of both so-called static sites and web applications — simultaneously. You don’t have to sacrifice the advantages of one approach to reap the benefits of the other.
</pullquote>

When you visit a Gatsby site, a static, server-rendered HTML page is loaded first, and then it hydrates into a React app.

I compare this to modern mattresses that are ordered online, and come compressed in a box, for easier delivery. Once it’s delivered and unboxed, it magically unfurls into a mattress.

![casper mattress inflating](./images/casper-unboxing.gif)

**Both ship small and bloom into much more.**

## 4. Prefetch resources for snappy routing

It’s not just important that Gatsby sites _are_ fast. It’s also important that they _seem_ even faster.

When a Gatsby page finishes loading, Gatsby starts prefetching resources for internal pages the user may navigate to (internal links that are visible in the viewport). It does this at a very low priority -- it will prioritize almost anything else for the current page over these prefetching requests.

On top of that, when a link is actively hovered over (a strong indication the user will visit that link), Gatsby will fetch the resources for that page at a higher priority.

This means that when the user navigates to another internal page, resources have already been quietly loaded in the background and routing feels instantaneous.

Say you order delivery for dinner. It arrives, you eat. Later, you look at the menu again and scan for dessert. You decide on one and press “order”. Your doorbell rings immediately, your dessert has arrived. It’s like the delivery person is a psychic. They arrive instantaneously, with exactly what you wanted, exactly when you want it.

![the flash delivering pizza](./images/the-flash-pizza.gif)

**Gatsby preloads resources for pages a user is likely to navigate to, like a psychic delivery person.**

## 5. Consolidate data sourcing and transformations

With Gatsby, your data can be sourced from just about anywhere -- content management systems, Markdown, APIs, databases, etc. A recent series on the Gatsby blog detailed the concept of the “[content mesh](https://www.gatsbyjs.org/blog/2018-10-04-journey-to-the-content-mesh/)”:

<pullquote>
  [Gatsby is] the infrastructure layer for a decoupled website. The content mesh stitches together content systems in a modern development environment while optimizing website delivery for performance.
</pullquote>

With Gatsby, you can source your data into a consolidated data layer, which you can query against directly. No matter where your data comes from, you can access it all from a single query. Get data from wherever it lives to the right place in your website in the right form exactly when it's needed.

This is like ordering from Amazon. Instead of heading to the grocery store, the hardware store, the electronics store, the pet store, etc., you can place a single order to Amazon to get items from them all. You don't have to worry about logistics, combining data, or managing multiple requests — it Just Works™.

You can make a single order to Amazon for a variety of items originating from a variety of sources; You can make a single query to the Gatsby data layer for a range of data originating from many different data sources.

**Gatsby consolidates your data into a single, queryable layer, like Amazon consolidates the online ordering experience from a multitude of vendors.**

## Wrap up

A lot of the core features of Gatsby seem to happen automagically; In this post I've aimed to abstract some of these core features into more approachable comparisons. These analogies may seem a bit silly, but I hope you enjoyed and found them helpful! We talked about the following developer experience and performance optimization features:

1. Start off with a pre-configured development environment and build process (High-performance car)
2. Benefit from built-in performance optimization (Neo’s Matrix skills)
3. Leverage static site delivery and web app experience (Compressed mattress)
4. Prefetch resources for snappy routing (Psychic delivery person)
5. Consolidate data sourcing and transformations (Amazon)

> 💡 Looking for a deeper dive into Gatsby's internals? Check out the "[behind the scenes](/docs/behind-the-scenes/)" section of the docs.
