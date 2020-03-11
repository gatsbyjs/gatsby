---
title: Challenge 11 - Source Data from a Headless CMS
date: 2020-03-11
author: "Hashim Warren"
excerpt: "Learn how to use a headless CMS with your Gatsby project"
tags: ["learning-to-code", "100-Days-of-Gatsby", "CMS"]
---

_Gatsby was named the [#1 new technology to learn in 2020](https://www.cnbc.com/2019/12/02/10-hottest-tech-skills-that-could-pay-off-most-in-2020-says-new-report.html)!_

_To help you learn about Gatsby and our ecosystem, we invite you to take the #100DaysOfGatsby challenge! If you are new to Gatsby, you can follow along with our beginner-friendly weekly prompts. Or if you are familiar with Gatsby and want to go deeper, we invite you to [build your first Gatsby Theme](/docs/themes/building-themes/)._

_Learn more about [#100DaysOfGatsby here](/blog/100days)!_

## Challenge 11:Make Your Site Content Editor Friendly by Connecting a CMS

This is the most important week of the #100DaysOfGatsby series! Up until now you’ve created a website with Markdown files, and you’ve had Gatsby [programmatically create pages](/tutorial/part-seven/) using those files, which is pretty cool. But Gatsby can do so much more...

What makes Gatsby unique and immensely useful for your most demanding client projects is the framework’s ability to source content from anywhere, and make it available through a flexible data layer.

As Kyle Mathews [wrote](/blog/2019-01-31-why-themes/):

> “A little-understood reason for Gatsby’s popularity: Gatsby’s data layer has the highly novel feature of enabling people to build and share data processing primitives that automatically work together and are exposed and controlled through a consistent GraphQL API. In most other frameworks, you’d need to build much of this yourself in a one-off, brittle fashion. Gatsby’s data layer enables simple snapping together of data sourcing and transformation primitives enabling the content mesh.”

The website you’re on right now is a combination of content from Airtable, Markdown, and raw JSX. Gatsbyjs.org also has a swag store that sources content from Shopify, and the [Gatsby Cloud website](https://gatsbyjs.com) gets data from Contentful and a PostgreSQL database. The days of shoehorning multiple content types into a monolithic CMS [are over](/blog/2018-10-04-journey-to-the-content-mesh). Now you can choose the best tool for the job, and stack (or switch) CMS’s easily.

Today we challenge you to add an external data source (or two) to your Gatsby project!

### Challenge Resources

1. ["What is a headless CMS?"](/docs/headless-cms/) is a solid place to get started. It also lists specific CMS’s that have Gatsby “source” plugins you can install..

2. If you’re not sure which CMS to choose, many Gatsby users have had success with [Contentful](/docs/sourcing-from-contentful/), [Cosmic JS](/blog/2018-06-07-build-a-gatsby-blog-using-the-cosmic-js-source-plugin/), and [DatoCMS](/docs/recipes/sourcing-data/). If you want to use an [open source and free CMS](/blog/2019-10-15-free-headless-cms/), try WordPress, Ghost, Netlify CMS, and Drupal.

3. If you’d like to learn from fully baked examples, [auto-provision a site from Gatsby Cloud](https://www.gatsbyjs.com/get-started). Examine and experiment with the gatsby-node.js API file and any additional plugins the CMS developers decided to add. Use the patterns you discover in your own project.

### What to Do If You Need Help

If you get stuck during the challenge, you can ask for help from the [Gatsby community](/contributing/community/) and the [ASKGatsbyJS](https://twitter.com/AskGatsbyJS) Twitter account. You can find fellow Gatsby Developers on [Discord](https://discordapp.com/invite/gatsby), [Reddit](https://www.reddit.com/r/gatsbyjs/), [Spectrum](https://spectrum.chat/gatsby-js), and [Dev](https://dev.to/t/gatsby).
