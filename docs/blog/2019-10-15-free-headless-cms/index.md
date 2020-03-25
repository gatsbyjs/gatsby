---
title: "3 Free Headless CMS's for Your Next Project"
date: 2019-10-15
author: "Hashim Warren"
excerpt: "Looking for a free headless CMS? This guide will give you a few solid and budget-friendly options to choose from"
tags: ["cms"]
---

So, you have a very big idea. But very little money. You [purchased a domain name](https://twitter.com/gatsbyjs/status/1169991336801525761), and now that great idea needs a proper website.

You decide you want to build your site with Gatsby and one of several [free hosting providers](/docs/deploying-and-hosting/), but you also need a [headless CMS](/docs/headless-cms/) that can start small and grow over time.

How do you know which headless CMS is right for your site? In this post, we’ll walk through important decisions to consider and weigh the pros and cons of three headless CMS options.

## Defining our headless CMS requirements

1. This headless CMS has to be free to use, and free to host.

2. This headless CMS has to be robust enough to grow with the site over time.

3. This headless CMS has to work with frontend frameworks like Gatsby.

The difficulty with these must-haves is that there are no _truly free_ options. There are open source projects that provide code for free, but you have to host it somewhere. Then, there are hosted headless CMS’s with generous free tiers. But most of them have prohibitive pricing once your project grows.

No headless CMS is truly free. So, let’s tweak our requirements and find an option that gives us the most power and flexibility for the lowest cost.

## Good news about the cost of a headless CMS

A different way of viewing cost is what is the price of a failed project? If you abandon a site, and move on to something else, how much do you need to pay out of your pocket every month to freeze your website and turn it into a museum of the work you put into it.

In the past you would pay a host and/or a CMS every month no matter your level of usage. And you would still need to keep the CMS updated and secure, even though you have no interest in the project anymore.

With a headless CMS architecture, the end-of-life for your website is dramatically different, and cheaper. If you plan to quit updating your site, you can unplug your headless CMS as a source, and the website’s assets will remain unchanged. Now, you can continue hosting your assets with a cheap or low cost CDN, without worrying about security problems, or high monthly fees. Your project can be the next Space Jam.

## Option #1. Headless WordPress

Every CMS search, headless or not, has to start with the question, “Why not WordPress?”. And for good reason - WordPress powers over 33% of the popular web, and has a dominant share of the content management software market.

Every writer or marketer who works on the Internet is familiar with WordPress, so onboarding is rarely an issue. And there’s a cottage industry of developer resources and documentation for WordPress available, so getting up to speed on the development side is relatively easy.

### How “free” is it?

Cheap hosting is easy to find - providers like Bluehost and Amazon Lightsail offer WordPress hosting for about \$4 dollars a month. Other popular hosts like GoDaddy can get you going for less than \$10 dollars a month.

If your website needed all-in-one WordPress, then these cheap, shared hosting packages wouldn’t be enough to handle a website that expects any sort of traffic. However, you’re just using headless WordPress, and all that you ask from the software is to organize your content, and send it to a frontend framework like Gatsby.

So, as long as the host is reputable, and the service is secure, you can buy the most cost-friendly hosting available. See Gatsby’s guide on getting started with [over a dozen headless CMS’s](https://www.gatsbyjs.org/docs/headless-cms/)

## Option #2. Netlify CMS

Netlify created a free headless CMS modeled after open source projects like WordPress and Drupal, so JAMstack sites would have options beyond SaaS CMS’s. [Netlify CMS](https://www.netlifycms.org/) cleverly uses cloud git services like GitHub and GitLab as the backend for your content, and claims to work with almost any static site generator, including Gatsby.

### How “free” is it?

Because Netlify CMS is tied to third party authentication and git services, it’s unclear at what point you’ll hit your head against a free line. You may also come across barriers and limitations if you want to use Netlify CMS to manage large files like images and videos.

## Option #3. Headless Ghost

Ghost is a Node-based, robust CMS that recently [added features](https://ghost.org/blog/jamstack/) to make the software easier to use within a headless CMS architecture. Ghost is used by Apple, Sky News, DuckDuckGo, Mozilla, Square, and CloudFlare - so you’ll be in good company if you choose it.

### How “free” is it?

Though Ghost is open source, it still requires hosting. The official Ghost recommendation is to use their own Ghost-optimized hosting at about \$30 dollars a month, or generic DigitalOcean hosting which can start at less than \$10 dollars.

## The Hidden Cost of Any Free Headless CMS

No matter how small the initial cost of a “free” headless CMS, the biggest tax you’ll pay is writer workflow. If you, or someone on your team hates writing and managing content within your CMS, then it doesn’t matter how much money was saved every month.

This is where the power of a headless CMS architecture shines. You can create a Gatsby site that starts with one free headless CMS, then switches to another if the first one didn’t fit your workflow, without making drastic changes to your site.

<Pullquote>
  The decoupled nature of your site erases concerns of CMS lock-in.
</Pullquote>

Now, that’s really being free!
