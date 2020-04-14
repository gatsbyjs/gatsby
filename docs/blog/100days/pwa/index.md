---
title: Challenge 7 - Turn Your Gatsby Site into a Progressive Web App
date: 2020-02-12
author: "Hashim Warren"
excerpt: "Learn how to make your Gatsby site work with poor internet service or offline"
tags: ["learning-to-code", "contest", "100-Days-of-Gatsby"]
---

_Gatsby was named the [#1 new technology to learn in 2020](https://www.cnbc.com/2019/12/02/10-hottest-tech-skills-that-could-pay-off-most-in-2020-says-new-report.html)!_

_To help you learn about Gatsby and our ecosystem, we invite you to take the #100DaysOfGatsby challenge! If you are new to Gatsby, you can follow along with our beginner-friendly weekly prompts. Or if you are familiar with Gatsby and want to go deeper, we invite you to [build your first Gatsby Theme](/docs/themes/building-themes/)._

_Learn more about [#100DaysOfGatsby here](/blog/100days)!_

## Challenge 7: Make Your Gatsby Site Work With Poor Internet Service and Offline

You may have been introduced to Gatsby as a [“static site generator”](/docs/glossary/static-site-generator/). And it’s true - a Gatsby project [is built into a set of static assets](/docs/overview-of-the-gatsby-build-process/) that can be hosted on a [low cost CDN](/docs/winning-over-engineering-leaders/#lower-costs), for _by-default_ security and blazing fast speed.

But Gatsby is best understood as a Progressive Web App generator, because with Gatsby you can produce websites with native mobile app capabilities. A Progressive Web App (PWA) is a new class of website that takes advantage of the web browser’s access to mobile device APIs, to provide features traditionally only associated with native apps.

<iframe
  width="560"
  height="315"
  src="https://www.youtube.com/embed/z2JgN6Ae-Bo"
  frameborder="0"
  allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
  allowfullscreen
  title="Progressive Web Apps - PWA Roadshow"
></iframe>

Imagine giving your website enhancements like offline mode, home screen installation, and push notifications. Well, those are exactly the features we want you to add to your Gatsby project this week!

### Challenge Resources

First, read our doc about [what makes a PWA](/docs/progressive-web-app/), a true PWA.

Next, add [gatsby-plugin-manifest](/packages/gatsby-plugin-manifest) to your site. THis makes it possible for users to save your site to their home screen.

Now, add [gatsby-plugin-offline](/packages/gatsby-plugin-offline) to your project. As the name suggests, this plugin will give your site’s users the ability to still navigate to different pages, even in airplane mode, or with a poor internet connection.

### What to Do If You Need Help

If you get stuck during the challenge, you can ask for help from the [Gatsby community](/contributing/community/) and the [ASKGatsbyJS](https://twitter.com/AskGatsbyJS) Twitter account. You can find fellow Gatsby Developers on [Discord](https://discordapp.com/invite/gatsby), [Reddit](https://www.reddit.com/r/gatsbyjs/), [Spectrum](https://spectrum.chat/gatsby-js), and [Dev](https://dev.to/t/gatsby).
