---
title: "Why Themes?"
date: 2019-01-31
author: "Kyle Mathews"
tags: ["themes"]
---

> _A site as a function of your data_

As some of you might have heard (or hoped), we're working on adding theme support to Gatsby. This blog post is a short intro into how we're thinking about themes for Gatsby.

This post is short on examples and concrete details. See [our other theme blog posts by Chris Biscardi](/blog/tags/themes) and his recent [talk at Gatsby Days on themes](https://youtu.be/wX84vXBpMR8).

## Introduction & Goal

Themes is a powerful new abstraction under development for Gatsby. They allow a developer to package up a site as a standalone product for others to use.

Abstractions are why programming works. Abstractions allow a developer to express their intent with ease.

For example, every developer needs to write files to a disk — so the hardware and software industry has responded by spending an incredible amount of money and time to make writing data to disk is easy, fast, and reliable.

Developers say Gatsby is "easy to use". Why? Because we’ve put 1000s of hours towards designing, creating, and documenting thoughtful abstractions with our APIs and plugin system. People have responded by creating [100s of new plugins over the last 1.5 years](/plugins/).

Good systems for creating abstractions help people collaborate on shared solutions to common problems. A community can pool together their combined understanding to create a better solution than any one person would make. So with Gatsby, when someone wants to [add google analytics](/packages/gatsby-plugin-google-analytics/?=google), [pull data from a CMS](/packages/gatsby-source-contentful/?=contentful), [optimize their images](/packages/gatsby-image/?=gatsby-image), etc. — instead of researching and experimenting to implement their own solution — they just install a plugin worked on and used by 10s of thousands of fellow web developers.

Great abstractions make developers and teams far more powerful and productive as they can leverage the intelligence and experience of many other people. This is why Open Source is so powerful.

Good APIs and systems for creating and sharing abstractions allow individuals, teams, and ecosystems to identify common problems and create common solutions.

Gatsby is uniquely valuable because our APIs, plugin system, and ecosystem design are uniquely good at enabling the creation and sharing of abstractions.

A great example of this is a little-understood reason for Gatsby’s popularity: Gatsby’s data layer has the highly novel feature of enabling people to build and share data processing primitives that automatically work together and are exposed and controlled through a consistent GraphQL API. In most other frameworks, you’d need to build much of this yourself in a one-off, brittle fashion. Gatsby’s data layer enables simple snapping together of data sourcing and transformation primitives enabling the [content mesh](/blog/2018-10-18-creating-compelling-content-experiences/). This saves a ton of time and greatly contributes to Gatsby’s power and ease of use.

The weakness of our abstractions to date, however, is that plugins are all at the same level of abstraction — meaning plugins can’t compose other plugins — which means there’s no way to ship a group of plugins and configuration designed to solve more complex requirements (e.g. a blog which needs Markdown processing, pagination, RSS feed, manifest, etc.).

The level of a given abstraction should be matched to the granularity of a developer’s intent. Many developers _do_ want fine-grained control over how they build their sites. They’re happy to dig into how Gatsby’s data layer works, learn GraphQL, play around with plugins, etc., especially if Gatsby is a tool they’ll be using extensively to build many types of sites. But for many people, they just want a blog and are frustrated that Gatsby requires jumping through extra hoops to get there.

Plugins have been a very successful lower-level abstraction for Gatsby. Themes is our new higher-level abstraction on the [ladder of website abstractions](http://worrydream.com/LadderOfAbstraction/) that will enable a new wave of innovation and usage as people use the abstraction to develop website "products" based on Gatsby they can open source or sell.

## Who are themes for?

- People new to Gatsby that want to get started quickly without a difficult learning curve

- People who have clear and common use-cases in mind for Gatsby (e.g. blog, e-commerce, documentation) and want to share the complexity of maintaining the underlying functionality with others — so pick a theme as the base for their site instead of starting from scratch

- OSS/Commercial entrepreneurs who want to create web products. Themes will enable them to assemble a product they can share or sell with others.

- Designers who want to create unique/beautiful website designs to share with others

## Why build themes?

We want everyone in the world to use Gatsby.

To make this possible, we need to make building sites with Gatsby a lot easier so they’re accessible to far more people and use cases.

Many users really love Gatsby because it lets them accomplish complex tasks with ease.

But for many other users, that want easy solutions to a common problems, they find Gatsby too difficult.

Some tweets to that effect:

https://twitter.com/sebmck/status/1085279417151057920

---

https://twitter.com/ericalli/status/1083271854653992962

https://twitter.com/ericalli/status/1083271856809897985

https://twitter.com/ericalli/status/1083271858605023232

---

https://twitter.com/jtth/status/1080519113930350592

https://twitter.com/jtth/status/1080519116195356674

https://twitter.com/jtth/status/1080519116992249858

https://twitter.com/jtth/status/1080519117688442880

https://twitter.com/jtth/status/1081288682785726464
