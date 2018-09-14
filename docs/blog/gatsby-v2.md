---
title: "Announcing Gatsby 2.0.0 🎉🎉🎉"
date: "2018-09-14"
author: "Kyle Mathews"
---

We're incredibly pleased to announce the 2nd major release of Gatsby!

Gatsby is a modern website and app generator. Thousands of developers use Gatsby to create amazing blogs, apps, marketing sites, ecommerce, documentation, and more!

[Read more](/) about how Gatsby improves developer productivity and performance by leveraging the latest web technologies.

V2.0.0 is the result of months of hard work by the Gatsby core team and 315 contributors. Thank you to everyone who's contributed and tested the betas!

This release focuses on performance and developer experience. Highlights include:

- Reduced build times by up to 75%
- Shrunk JavaScript client runtime by 31%
- Upgraded Gatsby to latest version of core dependencies, webpack 4, Babel 7, React 16.5

[Sign up for our v2 webinar to learn more about this release](https://www.gatsbyjs.com/v2-launch-webinar)

![Gatsby astronaut butler delivers v2](./images/gatsby-v2-astronaut.png)

## People using Gatsby

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

### Faster site builds

We focused heavily on improving build speeds for v2 and are very pleased to see large build speed improvements across many parts of the build pipeline.

Many sites should see large improvements to their build performance, up to 75% reduction.

Improvements include:

- [Reduced memory usage while server rendering pages](https://github.com/gatsbyjs/gatsby/pull/4912#issuecomment-381407967)
- Webpack 4 includes many speedups to JavaScript and CSS bundling.
- React 16 improved SSR performance 3-4x
- [This PR includes many small fixes to refactor slow algorithms](https://github.com/gatsbyjs/gatsby/pull/6226)
- [Use all available cores when server rendering pages](https://github.com/gatsbyjs/gatsby/pull/6417)

We're planning many more improvements for build performance. GraphQL query performance needs improved. We're also planning how to make additional parts of the build proces run across multiple cores.

### Shrunk JavaScript client runtime

We shrunk the core JavaScript we ship with every Gatsby site by 31%!

Gatsby v1's core JavaScript was 78.5kb and v2 is 53.9kb (both gzipped sizes).

The reductions are largely due to the hard work by libraries we rely on.

The React team decreased their lib's size by 30% React 15 to 16 (49.8kb to 34.8kb gzipped)

We also switched routers from react-router to @reach/router which also has a 25% smaller bundle (8kb to 6kb gzipped).

### React 16

We upgraded from React 15 to 16. The React 16 was a huge release for the React ecosystem with support for fragments, error boundaries, portals, support for custom DOM attributes, improved server-side rendering, and reduced file size.

[Read the React 16 release blog post](https://reactjs.org/blog/2017/09/26/react-v16.0.html).

### webpack 4

We're proud to use webpack for processing and bundling Gatsby site code, css, and assets.

Webpack 4 was a huge release bringing with it:
- Dramatic improvements to build times
- New code splitting algorithm
- New first-class support for lazy-loading CSS chunks.

Read more about the webpack 4 release:

- [webpack 4 release blog post](https://medium.com/webpack/webpack-4-released-today-6cdb994702d4)
- [Code Splitting optimizations](https://medium.com/webpack/webpack-4-code-splitting-chunk-graph-and-the-splitchunks-optimization-be739a861366)
- [mini-css-extract-plugin](https://github.com/webpack-contrib/mini-css-extract-plugin)

### Babel 7

Babel helps ensure that JavaScript you write works across different browsers (including older versions of Internet Explorer)

The upgrade brings:

- [Improved build speed](https://babeljs.io/blog/2018/08/27/7.0.0#speed)
- [Experimental support for automatic polyfilling](https://babeljs.io/blog/2018/08/27/7.0.0#automatic-polyfilling-experimental) [See also our docs for this feature](https://next.gatsbyjs.org/docs/browser-support/#polyfills)
- Support for more syntax e.g. Typescript and JSX Fragments

[Read the Babel 7 release blog post](https://babeljs.io/blog/2018/08/27/7.0.0).

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


[Sign up for our v2 webinar to learn more about this release](https://www.gatsbyjs.com/v2-launch-webinar)
