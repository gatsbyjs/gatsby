---
title: Gatsby Core Philosophy
---

Gatsby's core philosophy can be divided into three parts.

**First, [our vision](#the-gatsby-vision).** Our vision is to _[construct higher-level web building blocks](#construct-new-higher-level-web-building-blocks)_, and _[create a cohesive content mesh system](#create-a-cohesive-content-mesh-system)_, in order to _[make building websites fun](#make-building-websites-fun)_ and _[build a better web](#build-a-better-web)_.

**Second, [our tooling philosophy](#gatsbys-tooling-philosophy).** In order to make website building fun, Gatsby's tooling must embody certain qualities. These include:

- [bundling the modern JavaScript ecosystem](#bundle-the-modern-javascript-ecosystem-for-the-content-web)
- [progressive disclosure of complexity](#progressively-disclose-complexity)

**Third, [our community philosophy](#gatsbys-community-philosophy).** We can't do this alone, so we're striving to build the most inclusive community on the web. For that reason, we _[work in the open](#work-in-the-open)_. At all times, we believe, and strive to communicate, that _[you belong here](#you-belong-here)_.

## The Gatsby Vision

### Construct new, higher-level web building blocks

Today's building blocks for the web are components of HTML, CSS, and JavaScript.

We believe that in 5 or 10 years, we'll look back at many of these blocks like we look back at machine code or assembly language today; low-level languages that are great compile targets for higher-level languages that are easier to write in.

Using abstractions like React components, `gatsby-plugin-image`, and `gatsby-link`, we've begun to craft this higher-level language. But we're just getting started. Gatsby is a playground for discovering new building blocks for the web.

To [quote Alan Kay](https://www.youtube.com/watch?v=NdSD07U5uBs):

> “You get simplicity by finding slightly more sophisticated building blocks“.

[Read more here](/blog/2017-10-16-making-website-building-fun/#find-the-right-building-blocks).

### Create a cohesive "content mesh system"

Over the last few years, teams have begun moving from monolithic, integrated CMS setups to a modular "content mesh" pulling content and functionality from multiple sources and APIs. Their key challenge: pragmatically integrating all these pieces together.

Gatsby's goal is to build a "content mesh system" that knits modular, best-of-breed tools in content modeling, authentication, search, analytics, payments, UI frameworks, and so on -- into a unified, high-quality whole.

Read more on a [journey to the content mesh](/blog/2018-10-04-journey-to-the-content-mesh).

### Make building websites fun

Gatsby's vision is to make website development fun by making it simple.

Fred Brooks wrote in _The Mythical Man-Month_:

> The programmer, like the poet, works only slightly removed from pure thought-stuff. [They] build [their] castles in the air, from air, creating by exertion of the imagination. Few media of creation are so flexible, so easy to polish and rework, so readily capable of realizing grand conceptual structures…

Technology is incredibly fun when we, like the wizard of fantasy, can type an incantation on our computer and a new creation comes to life.

When this incantation is simple and takes seconds, we can easily get lost for hours in the rush of creation trying one thing after another improvising our way to an eventual design.

Developers, designers, demand-gen marketers, copywriters -- every stakeholder in a website project _can_ feel this -- with proper tooling.

As Bret Victor suggested in _Inventing on Principle_, each creator needs "an immediate connection to what they're making.”

These instant feedback loops are often felt near the beginning of projects. But they can quickly be drowned by project complexity.

Developers can spend hours waiting for deploys, tracking down phantom "tooling" bugs, and so on.

We believe that with the right building blocks, and an integrated content mesh system, website projects should continue to feel fun no matter how big they get. We believe that every member of a website team deserves the ability to easily see how their work fits into the whole.

When a copywriter edits a headline in their CMS, a designer draws a button in their illustration app, or a developer adds an if statement in their text editor, they shouldn’t have to imagine what their change looks like in context. They should see it -- immediately.

[Read more here](/blog/2017-10-16-making-website-building-fun/).

### Build a better web

Websites can have, or lack, many qualities. They can be fast, secure, maintainable, beautiful, accessible, and cheap (or not). They can be easy to build and iterate on, have great SEO, and be fun to work on (or not).

We believe that these qualities should be baked into frameworks, so they are delivered _by default_ rather than implemented on a per-site basis.

When features and qualities are only available if you implement them, that makes them a luxury -- available only to a few websites.

By contrast, by baking in qualities such as performance and security by default, Gatsby makes the right thing the easy thing.

We believe the most high-impact way to make the web better is to make it high-quality by default.

## Gatsby's tooling philosophy

### Bundle the modern JavaScript ecosystem for the content web

One key way Gatsby makes the content web high-quality by default is to neatly bundle the modern JavaScript ecosystem.

Traditional CMS development [presents many challenges](https://www.gatsbyjs.com/blog/2018-10-11-rise-of-modern-web-development/#traditional-cms-development-presents-challenges) such as walled-garden development, difficult-to-maintain local environments, and a challenging target environment.

Modern web development [bundles advances](https://www.gatsbyjs.com/blog/2018-10-11-rise-of-modern-web-development/#modern-frameworks-offer-stability-and-faster-development) in **performance** (bundle splitting, asset prefetching, offline support, image optimization, or server side rendering), **developer experience** (componentization via React, transpilation via Babel, webpack, hot reloading), **accessibility**, and **security** together.

Gatsby's goal is to bundle these advances in an easy-to-use package. We're open to any and all advances being made in the modern JavaScript world and would love to incorporate them into Gatsby!

For more on this, look at [the features Gatsby bundles together](/features).

### Progressively disclose complexity

One concept UX designers use to make applications easier to learn and less error-prone is called “progressive disclosure".

If you were designing a user interface, you might move advanced or rarely-used features to a secondary screen, such as "advanced settings".

Progressive disclosure simplifies the experience for most people without limiting the abilities of more advanced users.

We progressively disclose complexity by making features such as modifying webpack / Babel config, `gatsby-plugin-image`, and `gatsby-link` opt-in, simple one-off configuration choices. We avoid all-or-nothing "ejection" scenarios where to add further customization you have to leave the tool behind and manage all complexity (e.g. dependencies) yourself.

[Read more here](https://lengstorf.com/progressive-disclosure-of-complexity/).

## Gatsby's community philosophy

### Work in the open

Open source is at the core of Gatsby’s success, and one of the central tenets of open source is that things are done in the open and without smoke and mirrors.

Two of Gatsby’s core strengths are its community and ecosystem.

We’re convinced that the right path forward is to continue working in the open with both trust and support of our community.

Anyone can [open an issue](/contributing/how-to-file-an-issue/) and ask a question, and we'll respond. Anyone can submit a pull request, and we'll give honest feedback on it. Anyone can [submit an RFC](/contributing/rfc-process/) to make a major change to Gatsby. And when we want to do this, we'll submit an RFC as a proposal.

Many of Gatsby's key features emerged from conversation between contributors. If you plumb through Gatsby's old issues, you'll see discussion of many of the core ideas that led to Gatsby -- from our plugin system to performance optimizations and so on.

### You belong here

Open source is great for developers. It lets you:

- create a body of work and experience that looks great on a résumé or CV
- build a referral network for paid work
- turn it into a sustainable source of income

#### Barriers to contributing to open source

However, there are significant barriers to getting started in open source.

First, **getting started in open source is daunting**. OSS projects can be intimidating. They often have thousands of lines of code and tons of required context and history. Navigating GitHub can be confusing. And there can be awkward social dynamics: impostor syndrome and lack of support.

Second, **open source is an expense not everyone can afford**. Potential contributors may not have free time to work on open source, and their jobs may not support contributing as part of our workload.

Third, **many people don’t see themselves represented in open source.**

#### Overcoming these obstacles

We believe that these barriers aren't simply obstacles to contributing, they're also obstacles to creating thriving projects. When these barriers persist:

- projects lose so many brilliant people who have so much to contribute
- projects lose an opportunity to add more maintainers
- existing maintainers lose the opportunity to build support networks

Our approach is to be proactive in creating community by:

- actively reaching out and welcoming new contributors
- remembering how steep the learning curve can be
- investing in community as a primary measure of success

#### Community is everything

For Gatsby, the open source community is everything. We want to be the most welcoming, most inclusive, most fun open source community on the planet.

To accomplish this, we follow a guiding core value: you belong here.

Some things we do in order to create an inclusive, welcoming community include:

- An enforced [Code of conduct](/contributing/code-of-conduct/)
- [Commitment to accessibility](/blog/2019-04-18-gatsby-commitment-to-accessibility/)
- [Extensive docs](/docs)
- Friendlier robots
- Implicit trust
- Active gratitude

We’ve built an active community with thousands of contributors, and we want to live the example of what a great open source community can be.

[See more here](https://www.youtube.com/watch?v=8ARA7AD4yPs&feature=youtu.be&list=PLz8Iz-Fnk_eQGt4-VFFCXYuYcuKaw4F07)
