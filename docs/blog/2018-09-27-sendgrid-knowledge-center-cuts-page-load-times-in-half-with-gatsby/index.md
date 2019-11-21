---
title: SendGrid Knowledge Center cuts page load times in half with Gatsby
date: 2018-10-02
author: Linda Watkins
tags: ["case-studies"]
---

Justin Hall, Senior Web Developer at SendGrid had to find a way to rebuild the [SendGrid Knowledge Center](https://sendgrid.com/docs/) (docs site) as it was becoming outdated and the SendGrid team thought there was room for improvement on performance.

SendGrid is a customer communication platform that drives engagement and growth. The [SendGrid Knowledge Center](https://sendgrid.com/docs/) is used by their customers to learn how to get the most out of SendGrid’s features, answer questions, and learn best practices. It’s an essential customer success and retention tool but the team was having issues with the website. The site was somewhat confusing, complex, and outdated, creating a challenging user experience. Justin used Gatsby to build an organized, fast, reliable site that created a much better experience for the developers and users of the Knowledge Center.

![SendGrid Knowledge Center](./sendgrid_screenshot.png)

## The Problem

Justin was a freelance developer for over 10 years before working for SendGrid. He’s worked a lot with open source (WordPress and Drupal) as well as with software companies in product and marketing roles. He started with SendGrid over a year ago as the Senior Web Developer because he felt there was a lot of opportunity at the company and he enjoys the startup vibe.

When Justin started at SendGrid, the company had experienced tremendous growth in recent years and the Knowledge Center (docs site) had grown in many different directions in order to support a rapidly growing software application with new products. There were some challenges with the URL structure lacking consistency and the non-technical email marketing users would find themselves in API reference docs and be confused. It was time for a fresh approach to engineering the docs experience.

The site needed a major refresh and it was the perfect time to reconsider the best tool for the job. The actual performance of the site (page load times) didn’t seem too bad, but had room for improvement. And sometimes, when you get used to something, you don’t realize how much better it can actually be.

The UI/UX team did a lot of research about how people wanted to find information on the site and they determined that they had two distinct personas- developers and email marketers. The developers needed more technical content and the marketers needed less-technical content with easy to understand references. The team working on the website (2 technical docs writers) were used to working in Markdown and wanted to continue using this familiar tool.

## Reasons for using Gatsby

Justin didn’t want to work in Jekyll as it wasn’t as familiar to him and having GraphQL out of the box was very enticing. The Gatsby docs were super helpful and thorough, especially on how to get started- even some of the non-developer designers could use it. But the reason Justin went with Gatsby for this project was the support for Markdown (as the team was already comfortable using it) and node APIs, the plugin support was deep, and the community was very active. Also, SendGrid is a React shop so it seemed like a no brainer to give Gatsby a try. The team also knew node and JS. Justin looked at the API and decided it would be a big improvement to what they had.

They had a team of 3 working on the site, Justin, a designer, and a UI developer. One of the team members was a new hire who had never used Gatsby before but the tool was easy for him to jump in and learn quickly.

In the end, Gatsby was the clear winner from the other technologies because the ease of use for Markdown, performant built-in, easy to learn/use, kept things organized, and it uses modern JS. And the team’s experience was so good that the design team even started using Gatsby for a blog.

## Results

‘Everything is better with Gatsby- the initial page load is faster, page transitions are faster, and the docs team doesn’t have to manually build all the category pages.’

With GraphQL, queries could automatically populate landing pages rather than the SendGrid docs team having to manually build all the category pages. This saved a ton of time and ended up with a better user experience as new content was available faster.

In the end, the new Gatsby site was 20% faster (on initial page load times) and page transitions were 100% faster due to Gatsby’s pre-rendering. During the open beta, employees even commented on how fast the new site was and it was a noticeable difference to the end user. Even though faster page load times wasn’t the biggest factor in redoing the site, the team was pleasantly surprised at how much better a faster site was for the user experience.

## Final thoughts

The SendGrid team prefers to use Markdown, so they had no issues using Gatsby but Justin sees the need for a preview feature for content creators that need to see changes in context before they go live. [Gatsby Preview](https://www.gatsbyjs.com/preview/?no-cache=1) is coming soon and when that’s available, Justin plans to propose Gatsby to the marketing team.

In the end, going with Gatsby was a no-brainer because it met the needs of the developers and content creators (they could use Markdown and modern dev tools like React) and it created a better user experience with faster page loads and auto populated category pages. Everyone was happy and the SendGrid Knowledge Center was finally able to do what it was meant to- increase customer’s success in running engaging and intelligent email campaigns.
