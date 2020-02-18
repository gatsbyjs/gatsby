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

Together, we made 5657 commits to Gatsby in 2019. That's a 29% increase from 2018 (4364) and a 153% increase from 2017 (2236).

We released Gatsby 467 times in 2019. 😱 (Run `npm view gatsby time` to display the full list)

Out of these, 18 were minor releases adding significant functionality to Gatsby. Let's talk each of those.

### 2.1.0: useStaticQuery

#### [2019-02-13](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.0.120...gatsby@2.1.0)

The `useStaticQuery` hook was the first minor release in 2019. [Sid Chatterjee](https://twitter.com/chatsidhartha) built this just in time for the first stable release of React Hooks.

### 2.2.0: Schema Customization

#### [2019-03-19](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.1.39...gatsby@2.2.0)

This was a huge milestone in the development of Gatsby's GraphQL data layer. Built by [Mikhail Novikov](https://twitter.com/freiksenet) and [Stefan Probst](https://github.com/stefanprobst), this enabled users to declare their own custom GraphQL schema. Before this, your site's schema was exclusively inferred by Gatsby leading to a dependency on data and making it brittle. Read more about [Schema Customization](/blog/2019-03-18-releasing-new-schema-customization/) in the release blog post.

### 2.3.0: Telemetry

#### [2019-03-26](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.2.13...gatsby@2.3.0)

Gatsby 2.3.0 marked the release of telemetry in Gatsby. Built by [Jarmo Isotalo](https://twitter.com/JarmoIsotalo), Telemetry is [anonymous analytics data](/docs/telemetry/) that we send back to Gatsby to better understand the way our users interact with Gatsby CLI. This makes common errors _visible_ to the team and enables them to fix them even sooner.

### 2.4.0: Asset Prefix

#### [2019-05-02](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.3.36...gatsby@2.4.0)

A widely requested feature, assetPrefix built by [Dustin Schau](https://twitter.com/SchauDustin) allows users to host their site's JavaScript and CSS assets on a separate url, a common pattern in enterprise apps.

### 2.5.0: Schema Inference Controls

#### [2019-05-16](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.4.7...gatsby@2.5.0)

This release by [Mikhail Novikov](https://twitter.com/freiksenet) added controls to opt out of schema inference using GraphQL directives `@dontInfer`. We also added resolver extensions including `@link` and `@fileByRelativePath`

### 2.6.0: Ink for Gatsby CLI

#### [2019-05-21](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.5.7...gatsby@2.6.0)

[Ward Peeters](https://twitter.com/wardpeet) refactored Gatsby CLI to use Ink in this release. [Ink](https://github.com/vadimdemedes/ink) is a library that enables writing CLIs in React. This was a _hugely_ foundational release and enabled big improvements in the CLI. More about this coming soon! 😉

### 2.7.0: Merge User and Plugin Defined Types

#### [2019-05-23](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.6.4...gatsby@2.7.0)

This was follow up work to the Schema Customization feature, enabling users to extend types already defined by plugins. [Stefan Probst](https://github.com/stefanprobst) also enabled support for merging different GraphQL schema definition types including SDL, typeBuilder and graphql-js.

### 2.8.0: Sorting for Resolved Fields

#### [2019-05-31](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.7.6...gatsby@2.8.0)

Another release by [Stefan Probst](https://github.com/stefanprobst), this added support for sorting and filtering for resolved fields (ones that are _not_ on the Node itself). This enables users to filter and sort on fields that link to other Nodes, for example `frontmatter.author.name` when author comes from a linked Node.

### 2.9.0: Per Page Manifest

#### [2019-06-11](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.8.8...gatsby@2.9.0)

This release by [Anthony Marcar](https://github.com/moocar) was a _fundamental_ change to the Gatsby runtime, changing how page data is stored and fetched. Not only did this enable building larger Gatsby sites than before (we're talking in the order of thousands of pages) but also reduced the overhead of loading Gatsby pages from a linearly growing metric to constant. Read more about this in the [Per Page Manifest release blog post](/blog/2019-06-12-performance-improvements-for-large-sites/).

### 2.10.0: Drop Node 6

#### [2019-06-20](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.9.11...gatsby@2.10.0)

Support for Node 6 was dropped in this minor release.

### 2.11.0: Babel Transpilation for Dependencies

#### [2019-06-27](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.10.5...gatsby@2.11.0)

This release by [Ward Peeters](https://twitter.com/wardpeet) and [Sid Chatterjee](https://twitter.com/chatsidhartha) enabled babel transpilation for dependencies and as a result, added automatic polyfilling for third party packages, support for Gatsby queries in packages from npm and set the stage for Themes.

### 2.12.0: Custom Field Extensions

[2019-07-02](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.11.8...gatsby@2.12.0)

Another [Stefan](https://github.com/stefanprobst) classic, this releases enabled users to write their _own_ custom field extensions for reusable functionality to field revolvers.

### 2.13.1: Themes

#### [2019-07-02](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.12.1...gatsby@2.13.1)

This was a big one! [Chris Biscardi](https://twitter.com/chrisbiscardi) and the rest of the team released the _stable_ Themes API which had been experimental for a while. Along with Themes, they also added a couple of new themes based starters to make it easier to build them.

### 2.14.0: Better Split Chunks Config

#### [2019-08-26](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.13.83...gatsby@2.14.0)

Inspired by [Next.js](https://nextjs.org/), [Ward Peeters](https://twitter.com/wardpeet) added better split chunk config to Gatsby's base webpack config, making your site chunks more efficient.

### 2.15.0: Node Materialisation

#### [2019-08-30](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.14.7...gatsby@2.15.0)

Another big one! [Mikhail Novikov](https://twitter.com/freikesnet) rewrote much of Gatsby's Node model to support arbitrary data stores in the future. This was done to enable faster data stores in the future and larger Gatsby sites.

### 2.16.0: Structured Logging

#### [2019-10-14](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.15.37...gatsby@2.16.0)

[Michał Piechowiak](https://twitter.com/mipiechowiak) and [Sid Chatterjee](https://twitter.com/chatsidhartha) released their work on the Structured logging effort in this release. Most of this was a ground-up rewrite of the way Gatsby prints logs and activities, enabling alternative UIs for Gatsby including a Gatsby Desktop app in the future.

### 2.17.0: App Data

#### [2019-10-21](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.16.5...gatsby@2.17.0)

[Alex Fenton](https://twitter.com/afeno90) (contributor extraordinaire) moved the webpack compilation hash in Gatsby over to a separate file. This was a step forward for Anthony's effort in 2.9.0, making site uploads incremental and reducing the number of changed files per build.

### 2.18.0: Schema Rebuilding

#### [2019-11-19](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.17.17...gatsby@2.18.0)

[Vladimir Razuvaev](https://twitter.com/vrazuvaev) (who recently joined the Gatsby team) killed it in his first month (😱) and added support for automatic Schema rebuilding in the Gatsby CLI. This previously required users to restart the gatsby CLI when changing the schema of their gatsby sites.

There’s a _lot_ more that’s not included here including error message upgrades, several performance improvements, React prerelease tests, an in progress TS migration and more.

## 2020

We started off this year on a solid note with the release of [Gatsby Builds](/blog/2020-01-27-announcing-gatsby-builds-and-reports/), the _fastest_ way to build your Gatsby sites in the cloud. In OSS land, we've done plenty already as well.

### Internationalizing Gatsby Docs

[Nat Alison](https://twitter.com/tesseralis) resumed her effort of helping internationalize the Gatsby documentation. We want Gatsby to be the most accessible way to build for the web. If you're interested in contributing translations in a language of your choice, go check out the translation contribution guidelines!

### Accessible routing

[Madalyn Parker](https://twitter.com/madalynrose) released [Accessible Client Side Routing](/blog/2020-02-10-accessible-client-side-routing-improvements/) in Gatsby in 2.19.8. These improvements enable people relying on screen readers to successfully navigate sites built with Gatsby.

### Build performance

[Peter van der Zee](https://twitter.com/kuvos) has been working hard on making Gatsby faster. He's already done some improvements which have made a big impact on speeding up Gatsby builds for large sites. On some sites, we've seen hour long builds dropping down to under 5 minutes.

### Jobs API

[Ward Peeters](https://twitter.com/wardpeet) built the new Gatsby Jobs API which enables Gatsby to better distribute CPU intensive work like image processing and HTML generation to workers on local machines and the Cloud.

### New RFC Process

[Dustin Schau](https://twitter.com/SchauDustin) proposed a new RFC process late last year. The main difference is that we'll be creating a new, top-level `rfcs` folder within the [gatsbyjs/gatsby](https://github.com/gatsbyjs/gatsby) monorepo and deprecate the old [gatsbyjs/rfcs](https://github.com/gatsbyjs/rfcs) repo.

The main goal is to improve visibility and encourage more community engagement. Read more about [the new RFC process](https://github.com/gatsbyjs/rfcs/blob/master/text/0011-move-rfcs-to-monorepo.md) in its RFC. 😉

## What's next?

You might've noticed a trend in our work last year. Lots of it focussed on foundational improvements to Gatsby unlocking even bigger DX wins and new features that were just _not_ possible before.

This year, we're going to build on those improvements with a focus on _improving_ the Gatsby Developer Experience.

This includes

- making the CLI faster and cleaner
- adding tools for consuming themes easily
- making switching data sources for your site even easier
- better error messaging
- scaling to hundreds of thousands of pages

We're really looking forward to making Gatsby even better than it is! Thank you for reading and until next time.

❤️
