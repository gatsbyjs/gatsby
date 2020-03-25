---
title: "Learn JavaScript Deeply with Gatsby"
date: 2020-02-17
author: Hashim Warren
excerpt: "The best way to learn web development is abstractions on down, not core primitives on up. Gatsby gives you everything you need to get started quickly, while still customizing what you want as you grow."
tags:
  - open-source
  - javascript
  - react
  - gatsby-cloud
  - community
---

Using a Gatsby site is the most productive way to learn and master JavaScript, [React](/docs/glossary/react/), [Node.js](/docs/glossary/node), and [GraphQL](/docs/glossary/graphql). That's because Gatsby gives you a high performance car to test drive, before you learn how to build one yourself.

I've discovered firsthand a counterintuitive truth - the best way to learn web development is abstractions on down, not core primitives on up.

https://twitter.com/hashim_warren/status/1190612851527966721

When I worked at a [coding bootcamp](https://www.coderfoundry.com/), I witnessed students build three production quality apps in 12 weeks by using a framework like ASP.NET, and a front-end component library like Bootstrap. The brilliance of this approach is a learner can focus on mastering what's important, what's unique, and what's difficult, instead of wasting time solving trivial problems, or fiddling with infinite options.

Have you seen the stats? [Only 4% of learners](https://blog.udacity.com/2019/05/udacity-new-heights.html) who use online tech courses ever finish the course they purchased. I believe part of the reason for those failure rates is that well-meaning instructors swamp students by starting them off with the basics, then building knowledge up. That's not the best way to learn. You need to taste a cake before you can attempt to bake one. And after that, you should follow a good recipe, before you try to master ingredient selection and preparation.

Gatsby gives you both a delicious cake to taste, and a good recipe for baking your own! Let’s explore how:

## Scaffolding a New Project with Gatsby’s CLI

If you are experienced with using the command line, you can use [Gatsby’s CLI](/docs/gatsby-cli/) and the `gatsby new` command to spin up a React project for you. Then you can [get started creating pages](/docs/page-creation/) by dropping JSX-based templates in the "pages" folder. And Gatsby handles the routing for you!

When the TypeScript project adopted Gatsby for their site, it was in part because team members who are not familiar with React could participate in page creation by learning JSX, which is a templating language that favors HTML. Also, when my colleague at Gatsby, web designer Lennart Jörgens, started building Gatsby starters [he was excited](https://www.lekoarts.de/blog/wie-gatsby-mit-steigenden-anforderungen-und-faehigkeiten-wachsen-kann) that a little JSX knowledge was all he needed to be productive. From there he learned React and GraphQL quickly, and even joined Gatsby’s core team.

## Auto-provisioning a CMS connection with Gatsby Cloud

But what if you're not familiar with running Node or working on the command line, as the method above requires?

[Gatsby Cloud can auto-provision your site](https://www.gatsbyjs.com/cloud) with a starter template and content sourced from a headless CMS. No command line needed.

You can immediately begin publishing content through a friendly CMS interface, then inspect both the templates and composed files in your git repo to see what's going on. From there you can tinker with your site by changing, extending, or copy-pasting components.

And because Gatsby development relies on a modern, git-based workflow, you can branch your project, screw it up, and roll it back without consequence. With Gatsby, _you can play_, which is essential for rapidly learning difficult subjects like programming.

## Configuring Complex Features with Gatsby Plugins and Themes

Lastly, there are over a thousand [Gatsby Plugins and Themes](/plugins/), which allow you to install chunks of functionality into your site. Like Lennart, I am learning React through using and extending Gatsby, so I enjoy mining plugins and themes for JavaScript patterns I can add to my collection.

Now, compare that smooth learning experience I outlined to the pain I ran into when I attempted to adopt React the first time. I just wanted to build React-based "blocks" for Gutenberg, the new visual editor for WordPress. Before I could even see words on a screen I had to wrap my head around a mess of tooling, dependencies, and conventions I'd never encountered before. Frustrated but determined, I purchased a course on webpack, but quickly found myself trapped in the third realm of configuration hell.

I wish I'd have started my journey with [create-guten-block](https://github.com/ahmadawais/create-guten-block) or the [Advanced Custom Fields block builder](https://www.advancedcustomfields.com/blog/acf-5-8-introducing-acf-blocks-for-gutenberg/), two tools for rapid Gutenberg development. That way, I could have started learning with something functional to break apart and study. _Abstractions on down..._

I'm excited that I am now learning React not just to extend an editing experience for one CMS, but to build general websites and apps. A Gatsby project is a React project, so the React ecosystem can be used on a Gatsby site. Mastery of Gatsby gives you transferable skills - you are not confined to just one framework.

If you'd like to join me and thousands of others in learning JavaScript, React, Node.js, and GraphQL through Gatsby, [register for #100DaysOfGatsby](/blog/100days). You will receive weekly prompts that stair-step you into an increasingly powerful Gatsby project.
