---
title: "Gatsby Gazette: The 2019 Recap"
date: 2020-02-18
author: Sidhartha Chatterjee
excerpt: "The last year has been an exciting time for Gatsby. Let's recap over everything we did in 2019."
tags:
  - gazette
  - community
---

Welcome to a _special_ edition of the Gatsby Gazette. This one will recap everything we did in 2019. Well, not _everything_. But everything major enough that we can fit into this post.

For our more frequent readers who might already know much of this, we'll follow up with a walkthrough of our plans for 2020.

Before we dive in, thank you, dear reader. If you've been contributing code to Gatsby, helping improve our documentation, reporting bugs and issues or even simply using it, you've enabled so much of the progress we've made and will continue to make this year. Our superpower is _you_, the Gatsby community.

## The 2019 Recap

Let's get into it then.

1348 folks started contributing to Gatsby in 2019.

Together, we made 5657 commits to Gatsby in 2019.

That's a 29% increase from 2018 (4364) and a 153% increase from 2017 (2236).

We released Gatsby 467 times in 2019. 😱 (Run `npm view gatsby time` to display the full list)

Out of these, 18 were minor releases adding significant functionality to the Gatsby project we want to highlight below:

### 2.1.0: useStaticQuery hook

(2019-02-13)
(https://github.com/gatsbyjs/gatsby/compare/gatsby@2.0.120...gatsby@2.1.0)

The `useStaticQuery` hook was the first minor release in 2019. The author of this post built this just in time for the first stable release of React Hooks.

### 2.2.0: Schema Customization

(2019-03-19)
(https://github.com/gatsbyjs/gatsby/compare/gatsby@2.1.39...gatsby@2.2.0)

This was a huge milestone in the development of Gatsby's GraphQL data layer. Built by Mikhail and Stefan, this enabled users to declare their own custom GraphQL schema. Before this, you site's schema was exclusively inferred by Gatsby leading to a dependency on data and making it brittle.

### 2.3.0: Telemetry Instrumentation

(2019-03-26)
(https://github.com/gatsbyjs/gatsby/compare/gatsby@2.2.13...gatsby@2.3.0)

2.3.0 marked the release of telemetry in Gatsby. Built by Jarmo, Telemetry is anonymous analytics data that we send back to Gatsby to better understand the way our users interact with Gatsby CLI. This makes common errors _visible_ to the team and enables them to fix them even sooner.

### 2.4.0: assetPrefix

(2019-05-02)
(https://github.com/gatsbyjs/gatsby/compare/gatsby@2.3.36...gatsby@2.4.0)

A widely requested feature, assetPrefix built by Dustin allows users to host their site's JavaScript and CSS assets on a separate url, a common pattern in enterprise apps.

### 2.5.0: Schema inference controls and improvement

(2019-05-16)
(https://github.com/gatsbyjs/gatsby/compare/gatsby@2.4.7...gatsby@2.5.0)

This release by Mikhail added controls to opt out of schema inference using GraphQL directives `@dontInfer`. We also added resolver extensions including `@link` and `@fileByRelativePath`

### 2.6.0: Ink for gatsby-cli

(2019-05-21)
(https://github.com/gatsbyjs/gatsby/compare/gatsby@2.5.7...gatsby@2.6.0)

Ward refactored Gatsby CLI to use Ink in this release. [Ink](https://github.com/vadimdemedes/ink) is a library that enables writing CLIs in React. This was a _hugely_ foundational release and enabled big improvements in the CLI. More about this coming soon :wink:

### 2.7.0: Merge user-defined types with plugin-defined types

(2019-05-23)
(https://github.com/gatsbyjs/gatsby/compare/gatsby@2.6.4...gatsby@2.7.0)

This was follow up work to the Schema Customization feature, enabling users to extend types already defined by plugins. Stefan also enabled support for merging different GraphQL schema definition types including SDL, typeBuilder and graphql-js.

### 2.8.0: Allow sorting resolved fields

(2019-05-31)
(https://github.com/gatsbyjs/gatsby/compare/gatsby@2.7.6...gatsby@2.8.0)

Another Stefan release, this added support for sorting and filtering for resolved fields (ones that are _not_ on the Node itself). This enables users to filter and sort on fields that link to other Nodes, for example `frontmatter.author.name` when author comes from a linked Node.

### 2.9.0: Per-page manifests

(2019-06-11)
(https://github.com/gatsbyjs/gatsby/compare/gatsby@2.8.8...gatsby@2.9.0)

This release by Anthony was a _fundamental_ change to the Gatsby runtime, changing how page data is stored and fetched. Not only did this enable building larger Gatsby sites than before (we're talking in the order of thousands of pages) but also reduced the overhead of loading Gatsby pages from a linearly growing metric to constant.

### 2.10.0: Drop node 6

(2019-06-20)
(https://github.com/gatsbyjs/gatsby/compare/gatsby@2.9.11...gatsby@2.10.0)

Support for Node 6 was dropped in this minor release.

### 2.11.0: Add babel transpilation for all dependencies (e.g. within node_modules)

(2019-06-27)
(https://github.com/gatsbyjs/gatsby/compare/gatsby@2.10.5...gatsby@2.11.0)

This release by Ward and Sid enabled babel transpilation for dependencies and as a result, added automatic polyfilling for third party packages, support for Gatsby queries in packages from npm and set the stage for Themes.

### 2.12.0: Allow adding custom field extensions

(2019-07-02)
(https://github.com/gatsbyjs/gatsby/compare/gatsby@2.11.8...gatsby@2.12.0)

Another Stefan classic, this releases enabled users to write their _own_ custom field extensions for reusable functionality to field revolvers.

### 2.13.1: Themes release! Move \_\_experimentalThemes to plugins API

(2019-07-02)
(https://github.com/gatsbyjs/gatsby/compare/gatsby@2.12.1...gatsby@2.13.1)

This was a big one! Chris and the rest of the team released the _stable_ Themes API which had been experimental for a while. Along with Themes, they also added a couple of new themes based starters to make it easier to build them.

### 2.14.0: Add better split chunks config

(2019-08-26)
(https://github.com/gatsbyjs/gatsby/compare/gatsby@2.13.83...gatsby@2.14.0)

Inspired by Next.js, Ward added better split chunk config to Gatsby's base webpack config, making your site chunks more efficient.

### 2.15.0: Node materialisation

(2019-08-30)
(https://github.com/gatsbyjs/gatsby/compare/gatsby@2.14.7...gatsby@2.15.0)

Another big one! Mikhail rewrote much of Gatsby's Node model to support arbitrary data stores in the future. This was done to enable faster data stores in the future and larger Gatsby sites.

### 2.16.0: Structured logging

(2019-10-14)
(https://github.com/gatsbyjs/gatsby/compare/gatsby@2.15.37...gatsby@2.16.0)

Michal and Sid released their work on the Structured logging effort in this release. Most of this was a ground up rewrite of the way Gatsby stores and prints logs and activities enabling alternative UIs for the Gatsby CLI including a Gatsby Desktop app that is coming _soon_ :wink:

### 2.17.0: Move webpack compilation hash into app-data.json

(2019-10-21)
(https://github.com/gatsbyjs/gatsby/compare/gatsby@2.16.5...gatsby@2.17.0)

Alex Fenton (friend and contributor extraordinaire) moved the webpack compilation hash in Gatsby over to a separate file. This was a step forward for Anthony's effort in 2.9.0, making site uploads incremental and reducing the number of changed files per build.

### 2.18.0: Schema rebuilding

(2019-11-19)
(https://github.com/gatsbyjs/gatsby/compare/gatsby@2.17.17...gatsby@2.18.0)

Vlad (who recently joined the Gatsby team) killed it in his first month (😱) and added support for automatic Schema rebuilding in the Gatsby CLI. This previously required users to restart the gatsby CLI when changing the schema of their gatsby sites.

There’s a _lot_ more that’s not included here including error message upgrades, several performance improvements, React prerelease tests, an in progress TS migration and more.

## 2020

We started off this year on a solid note with the release of Gatsby Builds, the fastest way to build your Gatsby sites in the cloud. In open source land, we've done plenty already as well.

### Internationalizing Gatsby Docs

Nat resumed her effort of helping internationalize the Gatsby documentation. We want Gatsby to be the most accessible way to build for the web. If you're interested in contributing translations in a language of your choice, go check out the translation contribution guidelines!

### Accessible routing

Madalyn released accessible client side routing in Gatsby in 2.19.8. These improvements enable people relying on screen readers to successfully navigate sites built with Gatsby.

### Build performance

Peter has been working hard on making Gatsby faster. He's already done some improvements which have made a big impact on speeding up Gatsby builds for large sites. On some sites, we've seen hour long builds dropping down to under 5 minutes.

### Jobs API

Ward built the new Gatsby Jobs API which enables Gatsby to better distribute CPU intensive work like image processing and HTML generation to workers on local machines and the Cloud.

## What's next?

You might've noticed a trend in our work last year. Lots of it focussed on foundational improvements to Gatsby unlocking even bigger DX wins and new features that were just _not_ possible before.

This year, we're going to build on those improvements with a focus on _improving_ the Gatsby Developer Experience.

This includes

- making the CLI faster and cleaner
- adding tools for consuming themes easily
- making switching data sources for your site even easier
- better error messaging
- scaling to hundreds of thousands of pages

We'll tell you more as we get closer to these.

I hope you've enjoyed reading this as much as I've enjoyed writing it.

Until next time.

❤️,
Sid and the Gatsby core team
