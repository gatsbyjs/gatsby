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

There are multiple ways to accept user-generated content on your site. SO, instead of guiding you to one method, the resources below detail three options, along with the pros and cons of each approach.

### Gatsby Comments Resources

#### Option 1. Embed comments using JavaScript. 

*Pros and cons*: This is the simplest option and you can choose many low cost or free comment services. However, this method will have a negative impact on your site performance, and has privacy implications for your users. 

*Tutorial*: [Using Javascript-based comment service, Discus with Gatsby](/docs/adding-comments/#using-disqus-for-comments)

#### Option 2. Add comments to your content

*Pros and cons*: A new class of comment services have recently risen that enable users to submit comments on the frontend of your site, but will be server side rendered and displayed within your static HTML. Your site won’t see a performance hit, but they will experience a wait time for your comment approval, and the site’s build.  Unfortunately, most of these services only work with Markdown-based pages, with projects hosted on GitHub.

*Tutorial*: [Using git-based comment service, Staticman with Gatsby](/blog/2018-04-10-how-to-handle-comments-in-gatsby-blogs/)

#### Option 3. Roll your own comment engine

*Pros and cons*: If you want complete control of the design and functionality of your commenting on your site, you can create your own comment engine using low cost tools. This process is more advanced than using a third-party system, but once you create it, it can be reused for other features on your site, such as lead and feedback forms.
### What to Do If You Need Help

If you get stuck during the challenge, you can ask for help from the [Gatsby community](/contributing/community/) and the [ASKGatsbyJS](https://twitter.com/AskGatsbyJS) Twitter account. You can find fellow Gatsby Developers on [Discord](https://discordapp.com/invite/gatsby), [Reddit](https://www.reddit.com/r/gatsbyjs/), [Spectrum](https://spectrum.chat/gatsby-js), and [Dev](https://dev.to/t/gatsby).
