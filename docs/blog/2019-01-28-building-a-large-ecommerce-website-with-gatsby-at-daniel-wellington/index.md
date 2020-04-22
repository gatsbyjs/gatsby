---
title: Building a large, internationalized e-commerce website with Gatsby at Daniel Wellington
date: 2019-01-28
author: "Thibaut Remy"
tags: ["case-studies", "large-sites", "i18n"]
---

Around a year ago, we started discussing ways to improve performance on [Daniel Wellington](http://www.danielwellington.com)'s e-commerce website. Emerging markets like India require highly optimized web experience that we as web developers need to deliver on. We chose Gatsby as a tool to help us reach optimal performance.

In this post I will take you through our journey with Gatsby at Daniel Wellington, the challenges that we faced when scaling it up and how we overcame them.

## A bit of context

The Gatsby platform we are building is planned to support many markets and locales (currently around 40 and counting). Each market has around 1,000 pages, so we're in the ballpark of 10k to 50k pages.

Our migration to Gatsby is also not a work from scratch: we rely on the existing backend structure to provide us with features such as inventory and cart management. The whole payment flow is also not part of this migration.

## Optimizing build time

As we started to migrate a few markets to Gatsby, we quickly realized that the build time would easily skyrocket into a range that wouldn't work for our team. Each market was taking around 5 minutes to build, so at 40 markets we would reach _hours_ of build time.

We dug into the issue, and realized that our GraphQL queries were several orders of magnitude slower than the benchmarks (even the complex ones) provided by Gatsby.

One reason for this issue being our need for customization: every page (frontpage, category page or campaign page) can be fully customized, which results in our GraphQL queries being complex - and _slow_.

We started optimizing them by running them only when needed. For instance, our footer is the same on every single page (for a market), so it's better to run the query for that component in `gatsby-node`'s `createPages` and inject the result via the `context` of the page, rather than having the query for the footer in the page's GraphQL query.

It was a good improvement, but even the resulting 30-minute build time was too slow, because it was bottlenecking our content editors.

## Improving the preview experience

On a highly customizable website, previewing the changes you make is crucial. The fastest way to change something on a Gatsby platform is by using what we developers use daily: the development server. This server has a [feature](/docs/environment-variables/#reserved-environment-variables) that allows you to live reload the data on the development server and everything on the website will be updated automatically. Neat!

We started using this feature at the beginning of the migration, and content managers loved the feature. They just had to click a button to see their changes, all it took was a few seconds.

Unfortunately, that does not scale. The development server is made to be used for development, and we quickly ran into issues. The server would start crashing randomly after a few hundred reloads, and maintaining it was a big pain. It became worse when we reached around 20K pages, at this point the server was just running out of memory at startup time, and could not be accessed anymore.

We decided to solve these 2 major problems by slicing our website into smaller (and faster) websites. Since we have so many markets and locales, and each of these markets are pretty silo-ed (they don't communicate or share data with each other), it made a lot of sense to separate them from each other

<Pullquote>
  By splitting our 30K-page website into smaller 1K-page websites, we decreased
  our build time from 20+ minutes to 3 minutes.
</Pullquote>

Technically, we achieved this by setting an environment variable `GATSBY_LOCALE` when building the website, and that will restrict the amount of gatsby nodes and pages we create. To build the whole website, we parallelize the builds on multiple machines.

To manage this, we built our own internal interface as a separate React app. This enables content managers to preview their changes by requesting builds for specific markets.

## Going to production in a sane way

A great (and sometimes overlooked) inherent benefit of static generation makes us able to have a look at the website _exactly_ as our users will see it, before they see it. As a result, we never had issues that we didn't catch in our staging environments - the production build will generate the actual JS, CSS and HTML files that are tested before going live.

To achieve that, we perform our code release in 2 steps. The first step builds the website (with production settings) and hosts it on a static server. Once the build is completed, we check the website, the new features, the content and if everything is good, we jump to the next step: pushing _the same files_ to the production static servers. The fact that it's exactly the same files makes all the difference here: there is no random issues happening only in production environments, there is no issue that we can't reproduce in a controlled environment.

## The road ahead

Our migration is not complete yet as we're working hard on supporting all the markets we are present in, but we are confident in the fact that there are no blockers in using Gatsby. Some issues are still in our way but the team at Gatsby is working hard on solving them, and there are workarounds for all of them.

Are you interested in helping us solve our next challenges with Gatsby? Visit our [careers page](https://careers.danielwellington.com/) and join our evergrowing team in Stockholm!
