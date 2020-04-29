---
title: "Incredimental Builds"
date: 2020-04-29
author: "Josh Comeau"
excerpt: "A deeper look at Gatsby's recent announcement, how it changes the game for content editors, and what it means for the future."
tags: ["incremental builds", "gatsby cloud", "builds"]
canonicalLink: https://joshwcomeau.com/gatsby/incredimental-builds/
---

A few weeks ago, I published [A Static Future]('/gatsby/a-static-future'), a post all about how sites that build at compile-time have bucketfuls of untapped potential.

We pictured a world in which rich, dynamic web applications were built and served from static CDNs like Fastly and Cloudflare. Instead of a costly and error-prone database lookup on each request, we do the database lookups at compile-time, and re-build whenever the data changes. Instead of users pulling the latest data from our API, we push the data when it changes to the CDN.

This is a really exciting vision, but it only works if builds are lightning quick. If our data changes thousands of times a day, and it takes hours to rebuild the site, the math doesn't work.

Happily, this vision has gotten significantly more tangible recently, with our [incremental builds launch](https://gatsbyjs.org/blog/2020-04-22-announcing-incremental-builds/) last week 🎉

# What are incremental builds?

I think it's best explained through an example.

Let's say we're building an online magazine, something that mixes the content of Architectural Digest with the aesthetic of Cosmopolitan/Buzzfeed. I've named it METROGLAM.

![A mockup of a Cosmopolitan-style online magazine, except all the articles are about interior design and architecture](./images/metroglam.png)

We'll host each article in a CMS like Wordpress or Contentful. We'll have dozens of individual authors and editors, and we expect we'll average about 15 new articles a day, with maybe 100 or so daily edits (tweaks, corrections, live updates…). Whenever the content changes, it triggers a new build and deploys it live.

At first, this works great! Gatsby pulls all our data at build-time and generates beautiful, functional HTML files. After a couple years, though, our builds start to get a little sluggish; Once we hit 10,000 articles, it might take anywhere from 5 to 20 minutes to build.

When you think about it, this is actually pretty darn quick; in that time, Gatsby is able to render every React component on every page, for each individual content item. It has to fetch all that data from the CMS, and do a bunch of other important work like optimizing and resizing images.

Quick as it is, though, it's nowhere near quick enough. Let's imagine a scenario: you're an author for METROGLAM, and you've just published an article, _Reading Nooks To Die For_. Except, you realize in horror, you've made a typo:

![Screenshot of the article, showing the title “Reading Nooks To Die In”](./images/typo.png)

Frantically, you fix the typo and hit "publish"… But now, there's a 20 minute wait. Your macabre typo is public, and there's nothing you can do about it 💀

With more engineering, we can continue to improve the speed at which we build each page, but it'll always be an O(n) problem. There will always be problems of scale. What if we had an e-commerce site with 100,000 item pages? What if we were building a blogging platform with a million pages?

Incremental builds allow for lightning-quick rebuilds. The fundamental concept is the same: we generate HTML at compile-time, and store it on CDNs for quick retrieval. The difference is that we're able to do _partial recompiles_. Instead of needing to rebuild the entire site, we can rebuild only the pages affected by the content change. When we tweak the title of an article, we only have to build the affected pages, and it can happen near-instantaneously—builds often complete in **under 10 seconds**.

This effectively turns an O(n) problem into an O(1) problem. It doesn't matter how many pages our site has because we can ignore pages that haven't changed!

# Just the beginning

This launch is a monumental step: it takes us a lot closer to the magical future described in [A Static Future]('/gatsby/a-static-future'). But it's still just the beginning.

On Gatsby Cloud, we differentiate between _content_ changes and _code_ changes. When a content editor tweaks an article in a CMS, that triggers a content change. When a developer modifies a React component, that's a code change. What about [Markdown](https://en.wikipedia.org/wiki/Markdown) or [MDX](https://mdxjs.com/)? For our purposes, anything that gets committed to git is a code change.

Last week's launch supports content changes with a few specific CMS providers:

- Contentful
- Sanity
- DatoCMS
- CosmicJS
- Wordpress (alpha)
- Drupal (alpha)

In order to build incrementally, we need tight integration with the CMS to be able to detect changes. To get to the build speeds we're after, it's not fast enough to fetch all recent data and figure out what's changed; we need to integrate at a lower level with the CMS, and every CMS is different.

What if you're not using one of those CMS', or if your content is in Markdown? We hope to add full support soon, but there's a surprising benefit even today for _all_ gatsby sites.

# The other half of the story

When you think about it, a sub-10-second build is wild. Have you ever heard of a Webpack app being built that fast?!

There's two parts to Gatsby Cloud's incremental builds feature:

1. Figuring out which pages need to be rebuilt when specific content changes, by working out the data dependencies.
2. Intelligent, persistent, long-running caching and parallelization.

Each Gatsby build has a whole bunch of steps beyond fetching data from a CMS. With incremental builds, Gatsby Cloud is able to do really granular caching, and split work among many concurrent processes.

Either of these steps on their own is a massive boon, but their cumulative effect is absolutely magical. It's pretty ridiculous to watch a content-heavy site get updated live in only a few seconds.

And that second half—intelligent caching and parallelization—works for **all Gatsby sites!** For example, my personal blog uses MDX for its content, which is not a supported data source. Before incremental builds, it took 3-5 minutes to build. That time has shrunk to 2-3 minutes!

# Pipeline tweaks required

Incremental Builds, as defined by the two parts above, is a Gatsby Cloud exclusive feature. Reasonably, some folks were a bit disappointed by this.

It's important to clarify that in order to achieve the results that we have, we _need_ to own the CI/CD pipeline. This isn't something that can be packaged in our open-source repo.

Because Gatsby Cloud only has to build Gatsby sites, we can make all kinds of assumptions and optimizations around that. Other CI/CD platforms can't optimize their cloud infrastructure for a specific kind of site, since they need to support many different build processes and application types.

That said, it's important to us that Gatsby builds quickly on all platforms! And some of this **is** portable. For example, there is [experimental support](https://www.gatsbyjs.org/docs/page-build-optimizations-for-incremental-data-changes/) for "incremental data changes", to handle the content-diffing mentioned earlier.

We do believe that Gatsby Cloud should be the best place to build your Gatsby project, since we're able to make Gatsby-specific optimizations. But we also want Gatsby builds to be fast, no matter where they're built.

# Bright days ahead

The biggest pitfall of building a static site has always been the build times.

As that pitfall starts to evaporate, I'm super excited to see what kinds of developments we'll see in this area. What kinds of previously-unthinkable workflows will emerge? How broad will static pre-compilation spread?

We're still at the beginning, but it's a big early step.
