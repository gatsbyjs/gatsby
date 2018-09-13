---
title: "Announcing Gatsby 2.0.0 🎉🎉🎉"
date: "2018-09-14"
author: "Kyle Mathews"
---

We're incredibly pleased to announce the 2nd major release of Gatsby!

Gatsby is a modern web site and app generator focused on mobile performance and developer productivity.

V2.0.0 is the result of the months of hard work by the Gatsby core team and 315 contributors.

Highlights of this release include:

- 75% faster build times
- Our JavaScript client runtime is 23% smaller [TODO get actual number]
- Upgraded Gatsby to latest version of core dependencies, webpack 4, Babel 7, React 16.5

![Gatsby astronaut butler delivers v2](./images/gatsby-v2-astronaut.png)

## Try out Gatsby in 5 minutes

There's never been a better time to try out Gatsby!

- [Follow our getting started guide to build your first Gatsby site](/docs)
- Have an existing v1 Gatsby site? [Follow our migration guide to upgrade it to v2](/docs/migrating-from-v1-to-v2/).

## Rapidly growing ecosystem

This last year, since our v1 release, has been eventful to say the least.

- Gatsby is being adopted by organizations and agencies around the world
- 1000+ contributed to Gatsby
- Now merging ~80 PRs / week
- Gatsby was downloaded 4+ million times
- 550,000 people visited our website
- 15,500 people starred our GitHub Repo going from 10k to 25.5k stars
- Several core Gatsby contributors and I started a company and raised $3.7 million to support Gatsby OSS and create cloud tools to help teams build and deploy amazing Gatsby sites

## Showcase

Company logos + link to the website

## Gatsby's history

When I started working on Gatsby in early 2015, I spent a long time thinking about what would be the perfect way to build websites. I've always been obssessed with website speed and knew I wanted the framework to deliver blazing fast websites by default. I also love shipping and developing really quickly so wanted a framework that made it easy to start new projects and ship new features very quickly. Any thing that diverted my attention from working on design and features, I wanted to automate away.

- I shouldn't have to _configure my tools_ to start a new project
- I shouldn't have to _write custom code to fetch data_ from my CMS or other data sources
- I shouldn't have to _write custom code to transform data_ e.g. markdown to html
- I shouldn't have to _setup optimized production builds_ of my code
- I shouldn't have to _setup or manage servers and databases_ to run a large, high-traffic site (or small site)

I wanted a tool to help me build fast sites, faster.

These design goals led me to choose React. I'd already been using React for a year before I started working on Gatsby and was amazed at how productive I am building UIs with React.

I combined React with webpack and Babel into an easy-to-use installable where you could start new projects, develop with hot reloading, and build an optimized site with no fuss.

Then, with the growing community around Gatsby, we added an innovative data layer that lets you query data from your React components from any source.

We borrowed ideas from code compiliers, modern build systems like [Bazel](https://bazel.build/), and [Progressive Web Apps](https://developers.google.com/web/progressive-web-apps/) to analyze your site and automatically optimize page loads and site browsing performance.

Three and a half years later with 6,136 commits by 1095 contributors, Gatsby v2 is a mature, widely-used framework for building fast modern websites with amazing user _and_ developer experience.

## How does Gatsby make sites fast?

A fast site is one that loads very quickly and is fast to click around on mobile—no matter the network conditions.

We do extensive research and testing around front end performance to ensure Gatsby's sites are blazing fast out-of-the-box and _stay_ fast as you add new pages and features.

You can think of Gatsby as a [PWA](https://developers.google.com/web/progressive-web-apps/) generator!

I love seeing tweets from people showing off their [Lighthouse audit](https://developers.google.com/web/tools/lighthouse/) scores from their Gatsby site.

<blockquote class="twitter-tweet" data-lang="en"><p lang="en" dir="ltr">Nailed it! All perfect green circles in Lighthouse for my <a href="https://twitter.com/hashtag/react?src=hash&amp;ref_src=twsrc%5Etfw">#react</a> site. Thanks <a href="https://twitter.com/gatsbyjs?ref_src=twsrc%5Etfw">@gatsbyjs</a> <a href="https://t.co/LRxsjRCAfy">pic.twitter.com/LRxsjRCAfy</a></p>&mdash; Osmond 👨🏻‍💻 (@osmondvanhemert) <a href="https://twitter.com/osmondvanhemert/status/1035233190409949186?ref_src=twsrc%5Etfw">August 30, 2018</a></blockquote>

Gatsby helps you achieve fast sites by:

- Loading a lean static HTML version of your site so first paint is very fast
- Preloading resources for linked pages so clicking on a link instantly renders the next page
- Automatic route-based JavaScript and CSS splitting so pages only load the code actually needed for that page
- A Service Worker (using [gatsby-plugin-offline](/packages/gatsby-plugin-offline/)) smartly caches your site so repeat visits are very fast and your site will even work offline!

[Read more about why Gatsby is so fast in my blog post from last fall](/blog/2017-09-13-why-is-gatsby-so-fast/).

## How does Gatsby help developers be more productive?

Modern web tools are dramatically better than earlier generations of web tools and are a joy to work with.

React is the most popular way to build modern web experiences and is used daily by 100s of thousands of developers around the world.

Gatsby ties React, Babel, webpack, data and code hot reloading, and @reach/router into a cohesive, easy to install and use web framework.

Gatsby lets you use the tools you want to use for website projects.

We help you get started quickly with over [60 starters available to start a new project from](/docs/gatsby-starters/).

Gatsby's extensive plugin ecosystem frequently solves your problems as soon as you realize you have them.

There are now over 450 plugins ([see our plugin library](/packages/)) with more being added daily.

Plugins help you configure Gatsby with various JavaScript & CSS libraries and solve common website building problems like adding Google Analytics, SEO, and pulling data from your favorite CMS and other data sources.

We believe that productivity is part helping you work fast without getting stuck on problems. But the most important part of productivity is eliminating entire classes of work.

This is why we focus so much on automating site productivity as well as plugins which automate common web tasks such as fetching data with plugins. As entire classes of problems are automated away, this frees up your attention to build more and better experiences for your users.

## Gatsby swag!

By very popular demand, we're now selling stickers, socks, and t-shirts on our very own Gatsby eCommerce store (powered by Gatsby of course) at https://store.gatsbyjs.org/

Best of all, all contributors get free swag! Sign in with GitHub and claim your free swag.

![store.gatsbyjs.org screenshot](./images/gatsby-store.png)

## Growing the community

The Gatsby community has been growing very rapidly. We're seeing ~90 new PRs per week and and it's really exciting to see new contributors tackle different parts of the code base and add documentation, features, fix bugs, and refactor dusty corners of the code base.

We're investing heavily in scaling the velocity of the OSS project including:

- hiring more maintainers
- helping grow more maintainers through [pair programming](/docs/pair-programming/) & maintainer chat rooms & email list
- Investing heavily in automated testing to reduce manual testing of PRs
- Automating common checks and workflows
- Rewarding contributors with free swag
- Building maintainer dashboards to help direct our attention to the most important issues and PRs

## Website Information Architecture revamp

Alongside v2, we've been working on a large docs initiative to revamp the information architecture of our docs. We invest heavily in writing documentation as we know that great features don't matter if people can't use them. If you click to the [docs section](/docs/), you can see the new sidebar and IA. [Read Shannon Soper's writeup about the research behind the new IA](/blog/2018-07-31-docs-redesign/)

## New features in v2

### Faster builds
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
pull out stuff from site & link to it

### GraphQL stitching
Important as more and more public/private schemas exist. Gatsby is to make it easy to get data into site. Link to RFC

Combine static + dynamic

### Ludicrous Mode (aka faster data hot reloading)

### Layouts change
Short summary of change & link to RFC & blog post

### <StaticQuery>
Everyone wants to query in components, link to RFC (was their one?) and blog post

### Improvements to gatsby-plugin-offline
Highlight work by Kurt & David Bailey

### Tracing
Talk about why useful feature & add screenshot — link to PR by Anthony

## The future

- guess.js
- mdx

roadmap stuff. make it work, make it right, make it fast.
