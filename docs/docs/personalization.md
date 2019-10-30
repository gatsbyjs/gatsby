---
title: Personalization
---

## What is Personalization?

- Have you ever landed on a website that greeted you by name?

- Did you ever search for a book and realized your suggested results based on your previous purchases?

These are examples of personalization. Personalization adjusts the content of a website, and creates a custom experience for users. With personalization, one website can offer a variety of experiences to different visitors.

## Why is Personalization Important?

If you are [creating an e-commerce site](/tutorial/ecommerce-tutorial/), personalization is key in converting your visitors into buyers. Online merchants use personalization as a way to suggest relevant items to a shopper.

Outside of e-commerce, personalization is important for other types of websites, like e-learning. Personalization, if implemented strategically, can help educational sites deliver more targeted learning experiences. For example, if a learner is struggling with the learning the basics of JavaScript, the website can give the learner additional JavaScript practice problems.

## Using Personalization with Gatsby

Personalization contains dynamic content. Personalization is possible in Gatsby because Gatsby can enhance static content by [React Hydration](/blog/2018-10-15-beyond-static-intro/#hydration). During build time Gatsby invokes the React server-side DOM to generate content.

One possible way to go about personalization is through edge side includes (ESI). Edge side includes is a proposed web standard that allows developers to load dynamic content onto a webpage. The idea is you can cache most of your webpage except for the personalized portion of it. In the example of the e-commerce site, you will cache everything but the recommendation portion of the site. ESI can be [implemented in a service worker and you can learn more about it here](https://blog.cloudflare.com/edge-side-includes-with-cloudflare-workers/).

An alternative way to personalize your Gatsby site is to use the search engine Algolia. Algolia offers personalization by using inputs like Google Analytics, and the geography of the user when displaying a list of search results. Search results are also weighted on past behavior of other site visitors. You can get started using Algolia with Gatsby by downloading the [Gatsty Algolia plug-in](/docs/adding-search-with-algolia/).

## Other Resources

[W3C ESI Docs](https://www.w3.org/TR/esi-lang)
