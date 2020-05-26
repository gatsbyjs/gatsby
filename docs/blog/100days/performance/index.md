---
title: Challenge 10 - Keep Your Gatsby Site Blazing Fast
date: 2020-03-05
author: "Hashim Warren"
excerpt: "Learn how to audit your site for performance issues and provide common fixes"
tags: ["learning-to-code", "contest", "100-Days-of-Gatsby", "accessibility"]
---

_Gatsby was named the [#1 new technology to learn in 2020](https://www.cnbc.com/2019/12/02/10-hottest-tech-skills-that-could-pay-off-most-in-2020-says-new-report.html)!_

_To help you learn about Gatsby and our ecosystem, we invite you to take the #100DaysOfGatsby challenge! If you are new to Gatsby, you can follow along with our beginner-friendly weekly prompts. Or if you are familiar with Gatsby and want to go deeper, we invite you to [build your first Gatsby Theme](/docs/themes/building-themes/)._

_Learn more about [#100DaysOfGatsby here](/blog/100days)!_

## Make Your Site Faster Than The Competition’s

Over the last few weeks we’ve helped you get your site production-ready by focusing on [SEO](/blog/100days/seo/) and [accessibility](/blog/100days/accessibility/). This week we purposely saved “performance” for last, because the features we are inviting you to add to your site can have a positive impact on your search engine rankings (SEO), and your user's ability to consume your content (accessiblity).

If you embrace and master all of the resources we have shared in the last three weeks, you’ll create web projects that are noticeably faster, more usable, and will help your clients reach their business goals!

Let’s get started!

### Site Performance Resources

#### A. Monitor Site Performance

[Learn about Lighthouse](/docs/audit-with-lighthouse/) an open source tool that audits your site’s performance on mobile and desktop clients. Lighthouse is built in Chrome DevTools and can be run on demand.

You can also automatically run Lighthouse after every build if you [use Gatsby Cloud](https://gatsbyjs.com/cloud).

#### B. Intelligent Preloading

By leveraging Google Analytics data and machine learning, Guess.js is able to determine which pages a user is most likely to navigate to from the current page and only preload those resources. Thus, there are fewer network requests which improves performance on slower networks. Learn more [about Guess.js](/docs/optimizing-site-performance-with-guessjs/), and install [the Gatsby plugin](/packages/gatsby-plugin-guess-js).

#### C. CDN for Media Assets

Rich media like images, can have a negative impact on your build times when not handled properly. Consider offloading the processing and hosting of your images to a specialized CDN, like [Cloudinary](https://cloudinary.com/). Experiment with their [two new Gatsby plugins](/blog/2020-01-12-faster-sites-with-optimized-media-assets/) to see if it has a positive impact on your dev workflow and the browsing experience for your visitors

#### D. JavaScript Concerns

[A Gatsby site is better with JavaScript](/blog/2020-01-30-why-gatsby-is-better-with-javascript/#performance) because it enables performance features like the "intelligent preloading" that is mentioned above. However, if you’d like to experiment with changing the React runtime in your project to alternative smaller runtimes like Preact, then [there’s a plugin for that](/packages/gatsby-plugin-preact/).

#### What to Do If You Need Help

If you get stuck during the challenge, you can ask for help from the [Gatsby community](/contributing/community/) and the [AskGatsbyJS](https://twitter.com/AskGatsbyJS) Twitter account. You can find fellow Gatsby Developers on [Discord](https://discordapp.com/invite/gatsby), [Reddit](https://www.reddit.com/r/gatsbyjs/), [Spectrum](https://spectrum.chat/gatsby-js), and [Dev](https://dev.to/t/gatsby).

The subreddits for [React](https://www.reddit.com/r/reactjs/) and [Web Development](https://www.reddit.com/r/webdev/) are also good resources to discover and share web performance best practices.
