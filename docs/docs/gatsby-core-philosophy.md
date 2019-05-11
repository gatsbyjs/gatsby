---
title: Gatsby core philosophy
---

Gatsby's core philosophy can be divided into three parts. 

**First, our vision.** Our vision is to create better building blocks for the web, and unify the emerging content wesh. 

**Second, our tooling philosophy.** We want to make the right thing the easy thing and progressively disclose complexity. 

**Third, our community philosophy.** We're striving to create the most inclusive community on the web -- we believe in *working in the open*, and we believe that *you belong here*. 

## The Gatsby Vision

### Create better building blocks for the web

Gatsby's goal is to make website building easier by creating better building blocks for the web.

To [quote Alan Kay](https://www.youtube.com/watch?v=NdSD07U5uBs):

> “You get simplicity by finding slightly more sophisticated building blocks“.

Today's building blocks for the web are HTML, CSS, and Javascript; `<img>` and `<a href>` and so on.

We believe that in 20 or 25 years, we'll look back at many of these blocks like we look back at machine code or assembly language today; low-level languages that are great compile targets for higher-level languages that are easier to write in. 

Using abstractions like React components, `gatsby-image`, and `gatsby-link`, we've begun to craft this higher-level language. But we're just getting started. Gatsby is a playground for discovering new building blocks for the web.

[https://www.gatsbyjs.org/blog/2017-10-16-making-website-building-fun/](Read more here).

### Unify the content mesh

The CMS was born to make content sites possible. Now, it’s being reimagined to make them incredible.

In the early 2000s, publishing on the web was difficult. The CMS emerged as a single application to store content, build sites, and deliver them to users.

Over time, the feature landscape broadened — key areas like search, analytics, payments, personalization, and e-commerce emerged. In each category, specialized tools improved rapidly, while the quality of monolithic enterprise CMS applications has stayed roughly the same.

Today, there’s a multitude of vendors, frameworks, and approaches for content modelling, authentication, search, analytics, payments, development environment, performance, and so on.

Gatsby's goal is to unify the content mesh; empowering developers while preserving content creators’ workflows. Gatsby gives you access to best-of-breed services without the pain of manual integration.

[Read more here](https://www.gatsbyjs.org/blog/2018-10-04-journey-to-the-content-mesh).

## Gatsby's tooling philosophy

### Make the right thing the easy thing

As developers, we want to build great websites for our users.

However, we face constraints. Clients and employers usually have finite budgets and concrete deadlines. 

These constraints results in our sites being less performant, secure, scalable, maintainable, accessible, beautiful, than they would be if we had more time and resources.

Gatsby's approach is to create a website tool so that the laziest, shortcuttiest, under-the-gunniest decisions a developer can make will still result in an excellent user experience.

This includes:

* *great developer experience without sacrificing UX or performance*. Gatsby focuses heavily on reducing the barrier for developers to make good UX decisions by removing the difficulty in implementing them. Things that are typically pretty challenging to set up — such as bundle splitting, asset prefetching, offline support, image optimization, or server side rendering — are all done by default with Gatsby.

For example, our default starter gets a perfect score on webpagetest.org, so developers don’t have to think about the underlying setup at all. They can just build a website and know that the UX was already paid for by Gatsby’s underlying code.

Design decisions in Gatsby’s core are framed by a discussion of the trade-offs both for the developers working with the tools (i.e. the DX: is this pleasant to build with?) and the people who will actually use the sites that are built with it (i.e. the UX: does this improve the experience for the end user?). By taking both UX and DX into consideration, we’re able to avoid forcing a situation where the developers’ experience is at odds with the users’.

* *cheap, secure, and maintainable by default*. Built Gatsby sites are just files living on a CDN. This reduces risk by removing the CMS as an attack surface, drastically reduces cost to serve your site at scale, and reduces the need to keep running servers. 


### Progressive disclosure of complexity

In user experience, there’s a concept from the Nielsen Norman Group called “progressive disclosure", which is an approach to designing better user interfaces (UIs).

From their summary:

> Progressive disclosure defers advanced or rarely used features to a secondary screen, making applications easier to learn and less error-prone.

A common use of this pattern is on user profiles. If you’ve ever seen a page that has a link to “advanced settings”, that’s progressive disclosure: most people don’t care about or need to touch the advanced settings, so those are moved to a secondary screen where only power users will bother to go. This simplifies the experience for most people without limiting the abilities of more advanced users.

What’s powerful about this approach is that it gives the UI the ability to “react” to feedback. An advanced learner can ask for more, and the “teacher” (the UI) can turn up the complexity to meet the learner’s needs.

#### Abstractions

The most important concept of progressive disclosure is abstraction.

Put simply, abstractions are a set of default decisions that allow someone to accomplish something while remaining blissfully unaware that any decisions were made at all. When done well, good abstractions are how we make the right thing the easy thing.

If someone wants to change the defaults, they opt out of the abstraction and make those decisions on their own — and this is where things get tricky. To make sure we have progressive disclosure of complexity, we need to avoid a scenario where the abstraction becomes all-or-nothing.

#### How this applies to Gatsby

One of Gatsby's key roles is to bundle modern Javascript build tools. These include React, Babel, webpack, react-hot-loader, and so on.

These systems are incredibly powerful. At the same time, they are quite complex. Users shouldn't _need_ to know these systems exist.

Instead, their ES6 code should seamlessly transpile into a form accessible by modern browsers. If they want to use Typescript or Reason, they should be able to. If they want to upgrade (or downgrade!) from specific versions of React, they should be able to. 

Some "zero-config" frameworks bundle complexity together that is only configurable by "ejecting". The challenge with ejecting is that it takes you from simple to complex as soon as you move out of the happy path. 



## Gatsby's community philosophy

### You belong here.

Open source is great for developers. It lets you:

* create a body of work that looks great on a resume or CV
* build a referral network for paid work
* turn it into a sustainable source of income

#### Barriers to contributing to open source

However, there are significant barriers to getting started in open source.

First, **getting started in open source is daunting**. OSS projects can be intimidating. They often have thousands of lines of code and tons of required context and history. Navigating Github can be confusing. And there can be awkward social dynamics: imposter syndrome and lack of support.

Second, **open source is an expense not everyone can afford**. Potential contributors may not have free time to work on open source, and their jobs may not support contributing as part of our workload

Third, many people don’t see themselves represented in open source.

#### Overcoming these obstacles

We believe that that these barriers aren't simply obstacles to contributing, they're also obstacles to creating thriving projects. When these barriers persist:

* projects lose so many brilliant people who have so much to contribute
* projects lose an opportunity to add more maintainers
* existing maintainers lose the opportunity to build support networks

Our approach is to be proactive in creating community:

* actively reaching out and welcome new contributors
* remembering how steep the learning curve can be
* invest in community as a primary measure of success

#### Community is everything

For Gatsby, the open source community is everything. We want to be the most welcoming, most inclusive, most fun open source community on the planet.

To accomplish this, we follow a guiding core value: you belong here.

Some things we do in order to create an inclusive, welcoming community include:

* Code of conduct
* Commitment to accessibility
* Extensive docs
* Friendlier robots
* Implicit trust
* Active gratitude
* Active mentorship

We’ve built an active community with hundreds of contributors, and we want to live the example of what a great open source community can be.

### Work in the open

Open source is at the core of Gatsby’s success, and one of the central tenets of open source is that things are done in the open and without smoke, mirrors, pomp, circumstance, cloaks, or daggers.

Gatsby’s competitive advantage is the strength of its community and ecosystem, and we’re convinced that the right path forward is to continue working in the open, sharing our plans, ideas, struggles, and successes as transparently as possible.

Whenever we're considering an important change, we'll create an RFC in order to  