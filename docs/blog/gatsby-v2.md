---
title: "Announcing Gatsby 2.0.0 🎉🎉🎉"
date: "2018-09-14"
author: "Kyle Mathews"
---

We're incredibly pleased to announce the 2nd major release of Gatsby!

Gatsby is a modern website and app generator focused on developer productivity and performance by leveraging the latest web technologies.

Thousands of developers use Gatsby to create amazing blogs, apps, marketing sites, ecommerce, documentation, and more!

V2.0.0 is the result of months of hard work by the Gatsby core team and 315 contributors.

This release focuses on performance and developer experience. Highlights include:

- Reduced build times by up to 75%
- Shrunk JavaScript client runtime by 23% [TODO get actual number]
- Upgraded Gatsby to latest version of core dependencies, webpack 4, Babel 7, React 16.5

[Sign up for our v2 webinar to learn more about this release](https://www.gatsbyjs.com/v2-launch-webinar)

![Gatsby astronaut butler delivers v2](./images/gatsby-v2-astronaut.png)

## Showcase

These are some of the fine companies that trust Gatsby.

Company logos + link to the website

Along with Gatsby v2, we’re launching a new site showcase showing off the great work the Gatsby community is doing.

[Visit the new site showcase](/showcase/)

## Rapidly growing ecosystem

We’ve grown a lot in the last year since the Gatsby v1 release.

- We’ve reached 1100 contributors (up from 198)
- Now merging ~90 PRs / week (up from ~50)
- Gatsby was downloaded 4+ million times
- 550,000 people visited our website
- 15,500 people starred our GitHub Repo going from 10k to 25.5k stars
- [Several core Gatsby contributors and I started a company](/blog/2018-05-24-launching-new-gatsby-company/) and raised $3.7 million to support Gatsby OSS and create cloud tools to help teams build and deploy amazing Gatsby sites

## What’s new in v2

### Faster builds

We focused heavily on improving build speeds for v2 and are very pleased to see large build speed improvements across many parts of the build pipeline.

Improvements include:

- [Reduced memory usage while server rendering pages](https://github.com/gatsbyjs/gatsby/pull/4912#issuecomment-381407967)
- Webpack 4 includes many speedups to JavaScript and CSS bundling.
- React 16 improved SSR performance 3-4x
- [This PR includes many small fixes to refactor slow algorithms](https://github.com/gatsbyjs/gatsby/pull/6226)
- [Use all available cores when server rendering pages](https://github.com/gatsbyjs/gatsby/pull/6417)

webpack 4/babel 7/run page rendering across all cores/hulksmash fixed slowdowns in code

### Smaller client runtime
React 16 smaller & @reach/router smaller

### React 16
Pull out some stuff from their blog post & link to it

### webpack 4
Pull out some stuff from their blog post & link to it

### Babel 7
Pull out some stuff from their blog post & link to it

### Improved accessibility with @reach/router
- Keyboard access
- Assistive devices announce correctly
- Focus Management
pull out stuff from site & link to it

### GraphQL stitching
Important as more and more public/private schemas exist. Gatsby is to make it easy to get data into site. Link to RFC

Combine static + dynamic

### Ludicrous Mode (aka faster data hot reloading)

We spent some time optimizing Gatsby's data processing layer to make markdown editing even nicer!

<blockquote class="twitter-tweet" data-lang="en"><p lang="en" dir="ltr">Coming soon to Gatsby v2: Ludicrous mode data hot reloading ;-)<a href="https://t.co/by1PyOYXc0">https://t.co/by1PyOYXc0</a><br><br>(note, this gif is not sped up at all) <a href="https://t.co/hFIYMbpalN">pic.twitter.com/hFIYMbpalN</a></p>&mdash; Gatsby (@gatsbyjs) <a href="https://twitter.com/gatsbyjs/status/974507205121617920?ref_src=twsrc%5Etfw">March 16, 2018</a></blockquote>

### Layouts change
Short summary of change & link to RFC & blog post

### <StaticQuery>
Everyone wants to query in components, link to RFC (was their one?) and blog post

### Improvements to gatsby-plugin-offline
Highlight work by Kurt & David Bailey

### Tracing
Talk about why useful feature & add screenshot — link to PR by Anthony

## Gatsby swag!

By very popular demand, we're now selling stickers, socks, and t-shirts on our very own Gatsby eCommerce store (powered by Gatsby of course) at https://store.gatsbyjs.org/

Best of all, contributors get free swag! Sign in with GitHub and claim your free swag.

![store.gatsbyjs.org screenshot](./images/gatsby-store.png)

## Growing the community

The Gatsby community has been growing very rapidly. We're seeing ~90 new PRs per week and it's really exciting to see new contributors tackle different parts of the code base and add documentation, features, fix bugs, and refactor dusty corners of the code base.

We're investing heavily in scaling the velocity of the OSS project including:

- Hiring more maintainers
- Helping grow more maintainers through [pair programming](/docs/pair-programming/) & maintainer chat rooms & email list
- Writing more automated tests to reduce manual PR testing
- Automating common checks and workflows
- Rewarding contributors with free swag
- Building maintainer dashboards to help direct our attention to the most important issues and PRs

## Website Information Architecture revamp

Alongside v2, we've been working on a large docs initiative to revamp the information architecture of our docs. We invest heavily in writing documentation as we know that great features don't matter if people can't use them. If you click to the [docs section](/docs/), you can see the new sidebar and IA.

[Read Shannon Soper's writeup about the research behind the new IA](/blog/2018-07-31-docs-redesign/)

## Get started with Gatsby in 5 minutes

- [Follow our getting started guide to build your first Gatsby site](/docs)
- Have an existing v1 Gatsby site? [Follow our migration guide to upgrade it to v2](/docs/migrating-from-v1-to-v2/).

## The future

- guess.js
- mdx

roadmap stuff. make it work, make it right, make it fast.



