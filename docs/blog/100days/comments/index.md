---
title: Challenge 13 - Enable Comments to Your Gatsby Blog
date: 2020-03-26
author: "Hashim Warren"
excerpt: "Learn how to accept user-generated content on your Gatsby site"
tags: ["learning-to-code", "100-Days-of-Gatsby"]
---

_Gatsby was named the [#1 new technology to learn in 2020](https://www.cnbc.com/2019/12/02/10-hottest-tech-skills-that-could-pay-off-most-in-2020-says-new-report.html)!_

_To help you learn about Gatsby and our ecosystem, we invite you to take the #100DaysOfGatsby challenge! If you are new to Gatsby, you can follow along with our beginner-friendly weekly prompts. Or if you are familiar with Gatsby and want to go deeper, we invite you to [build your first Gatsby Theme](/docs/themes/building-themes/)._

_Learn more about [#100DaysOfGatsby here](/blog/100days)!_

## Challenge 13: Add Gated Content to Your Website

In a previous challenge you made your Gatsby site into a dynamic app by enabling [authentication and private routes](/blog/100days/apps/). This week you'll learn how to include another dynamic feature that is common for blogs - user comments!

There are multiple ways to accept user-generated content on your site. So, instead of guiding you to one method, the resources below detail three options, along with the pros and cons of each approach.

### Gatsby Comments Resources

#### Option 1. Embed comments using JavaScript.

_Pros and cons_: This approach is the simplest option for adding comments to your site. You can choose many low cost or free comment services, like Discus and Facebook Comments. However, this method will have a negative impact on your site performance, and has privacy implications for your users.

_Tutorial_: [Using Javascript-based comment service, Discus with Gatsby](/docs/adding-comments/#using-disqus-for-comments)

#### Option 2. Add comments to your content

_Pros and cons_: A new class of comment services have recently risen that enable users to submit comments that will be server side rendered and displayed within your static HTML. Your site probably won’t see a performance hit, but users will experience a wait time for your comment approval, and the site’s [build](/docs/glossary/build/). Unfortunately, most of these services only work with Markdown-based pages, for projects hosted on GitHub.

_Tutorial_: [Using git-based comment service, Staticman with Gatsby](/blog/2018-04-10-how-to-handle-comments-in-gatsby-blogs/)

#### Option 3. Roll your own comment engine

_Pros and cons_: If you want complete control of the design and functionality of your commenting on your site, you can create your own commenting workflow using low cost tools. This process is more advanced than using a third-party service, but once you create it, it can be reused for other features on your site, such as lead and feedback collection.

_Tutorial_: [DIY Gatsby comments tutorial](/blog/2019-08-27-roll-your-own-comment-system/)

### What to Do If You Need Help

If you get stuck during the challenge, you can ask for help from the [Gatsby community](/contributing/community/) and the [ASKGatsbyJS](https://twitter.com/AskGatsbyJS) Twitter account. You can find fellow Gatsby Developers on [Discord](https://discordapp.com/invite/gatsby), [Reddit](https://www.reddit.com/r/gatsbyjs/), [Spectrum](https://spectrum.chat/gatsby-js), and [Dev](https://dev.to/t/gatsby).
