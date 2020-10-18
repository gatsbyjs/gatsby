---
title: "Why Gatsby Can Be More Profitable for Your Agency Than WordPress"
date: 2019-06-25
author: Hashim Warren
tags:
  - agencies
  - marketing
  - wordpress
  - aws
---

<!--
    Below this, Link has been imported as GatsbyLink to get around a bug in prettier v1.19.1
    where case sensitivity is not respected for components in MDX. Link is treated as <link>
    html head tag by prettier which leads to an error.
    Issue Link - https://github.com/prettier/prettier/issues/7548
-->

import { Link as GatsbyLink } from "gatsby"

Are you a WordPress Developer?

If yes, then you can relate to this. Every off-year we're greeted by a sales pitch from some hot new tool that wants to take the website builder throne.

You know what I'm talking about. Their conference slide decks always have the same structure:

## SLIDE 1: WordPress is slow.

## SLIDE 2: WordPress is not secure.

## SLIDE 3: WordPress is old

## FINAL SLIDE: So use our NewThing.

Skeptical minds in the audience might sit back and laugh each time:

_Slow?_ C'mon now. You're able to get load time for your client sites down to less than 2 seconds and even faster, thanks to caching and image optimization and CDN services.

_Not secure?_ Hold up. You haven't had a site get hacked this decade. You use quality hosting, reputable plugins, and you've turned on automatic core updates. Plus, you create daily off-site backups just in case.

_And old!?_ Not in your experience. You feel like a kid in a candy store, surrounded by all of the innovation WordPress has rolled out the last few years. You've barely taste-tested the WordPress Rest API, or the new React-powered content editor.

So if you're a WordPress Developer and you've dismissed Gatsby as this year's NewThing, then I get it.

## You've seen this story before, right?

I think you may be surprised. I was skeptical myself, but I found one real difference between WordPress and Gatsby, and it has a true impact on your business:

<Pullquote>
  Gatsby sites have a dramatically lower{" "}
  <GatsbyLink to="/blog/2019-05-15-enterprise-gatsby-how-to-reduce-your-digital-total-cost-of-ownership-with-gatsby/">
    "total cost of ownership"
  </GatsbyLink>{" "}
  than comparable WordPress sites.
</Pullquote>

That means more money in your pocket. Or more value and services you can pass on to your clients.

Before we dive into specific areas where costs are lower, let's level set. The WordPress community is huge, and even the title "WordPress Developer" is expansive. This article is for you if you work independently or at a small agency with a business model of not just building new sites, but maintaining them over time. If the lion's share of your revenue comes from the end-to-end management of sites, with clients paying your retainer, then Gatsby is worth your consideration.

However, if your job is to build custom WordPress solutions for large sites, then never deal with them again, the cost savings I lay out may not matter as much to you.

## Hosting for Gatsby sites starts at \$0

Last year I built a WordPress website for an event. I used a few popular membership and e-commerce plugins to get the job done. The price of hosting and plugins were all obscured from the client. I was paid a fee, and then I turned around and paid for hosting and plugins, and pocketed the margin.

I even collected an affiliate fee from the server host. Again, if site maintenance is your bread-and-butter, then you know this model. Every nickel counts.

After the event, my client no longer needed the membership and e-commerce features. And they weren't enthusiastic about paying me for ongoing support. So, instead of haggling over a price, or handing over the project and losing their business forever, I turned the WordPress project into a static site that I host on Netlify.

The hosting cost? [Zero dollars and zero cents.](https://www.netlify.com/pricing/)

That project opened my eyes. The client had a low traffic website, and they barely used the membership and e-commerce functionality I added. Yet, I signed them up with my favorite WordPress host, with pricing that started at \$115 a month, not including the cost of premium plugins. The next time I had a similar project, which was earlier this year, I grabbed Netlify from the beginning.

The cheaper hosting for static sites, like the ones Gatsby can produce, can be a game changer for your business model. That's because the client is willing to pay for an all-inclusive package, and doesn't care if you use an inexpensive static site host, or a costly WordPress host. By making the right choice your profit can increase from day one, and accelerate if you keep the project over months or years.

I'm old enough to remember using Movable Type and sneering at WordPress. I worked at Vibe Magazine and didn't choose WordPress as our CMS because at the time it couldn't handle our requirement for multiple authors. However, Movable Type eventually ceded their #1 position to WordPress, in large part due to hosting costs. Hosting for a PHP CMS like WordPress was cheaper and simpler than finding a home for the Perl-powered Movable Type.

Static sites in general, and Gatsby in particular will win because the cost of getting started, and keeping going is so low. And as a bonus, static site hosting truly is more secure and simpler to use. It's rare that a new way of doing things ticks the boxes of FAST, GOOD, and CHEAP with no compromise. But that perfectly describes [the hosting options for Gatsby](/docs/deploying-and-hosting/).

## Break-Fix happens less, and is solved faster

A core service you probably offer your clients is break-fix. That is, when something breaks on their site, you swoop in and fix it. It's the biggest selling point for a client. They are willing to pay your monthly retainer for the insurance of having a professional on hand if anything goes wrong.

And it's the biggest driver of your profit. You're not ashamed to admit that breakage doesn't happen that often. That's because your initial WordPress setup and selection of themes and plugins is considerate. So, your clients pay monthly for a situation that only arises maybe twice a year.

But what keeps you up at night? What makes you sweat when you think about it?

I know. It's that random bug or issue that takes hours or days longer to fix than you ever planned for. It could be a problem with WordPress core, or the server, the hosting provider, or a plugin, or the way two plugins are interacting with each other.

I once discovered a bug caused by a page builder plugin update that prevented a theme from displaying comments. I spent half a day sussing out the culprit, then another day getting the page builder's support team to take responsibility and recognize it as a true bug. Then a week later it was fixed.

Because WordPress plugins are writing to the same database, using the same platform functions, and jockeying for space in the same admin area, the permutations of potential problems is high. And solving issues can take a lot of time. Also, unless you lock down your WordPress projects with as little user privileges as possible, then you're sure to get a call every so often about something your client broke themself.

Gatsby is different. Consider this example:

If your client needs e-commerce features on their site, Gatsby can pull in the product data and shopping cart functionality from two different services, if you so choose. Those two services are not produced by the same server, or writing to the same database. So a problem with one may not affect the other.

In theory, break-fix for Gatsby should be easier to diagnose and solve. An issue with the build has nothing to do with a problem with the frontend, and vice versa. Gatsby's lower technical maintenance may be the difference between you taking on 5 client sites or 15.

<Pullquote>
  Personally I keep forgetting about the static sites under my care because
  there's literally nothing to work on for them month-to-month.
</Pullquote>

## Freemium is cheaper than pay-per-year Plugins

The WordPress ecosystem is bursting with solutions, paid and free, for any use case your clients have. I'm personally very grateful for that.

Recently, premium plugin companies have discovered that the value of their software, and the cost of customer service, are both higher than expected. If you think break-fix is hard for us, imagine having your code run on thousands of different environments, and hosting platforms, and versions of PHP. So, of course, plugin prices have gone up. I don't begrudge the fact that many of my favorite WordPress shops are asking for more.

Again, the Gatsby ecosystem is different. Like hosting, the standard pricing for third-party website services is a generous free tier.

There are a dozen [Gatsby-friendly form builders](/docs/building-a-contact-form) with unlimited trials and free tiers. And if you create a form handler yourself, using a React library for forms, plus [Amazon API Gateway / Lambda / SES](https://aws.amazon.com/blogs/architecture/create-dynamic-contact-forms-for-s3-static-websites-using-aws-lambda-amazon-api-gateway-and-amazon-ses/), then your client can handle half a million submissions a month for under \$5.

That's amazing!

## The bottom line - Gatsby will make your agency more profitable

Brian Webster of Delicious Simplicity shared that using Gatsby for client sites has enabled him to win more bids, because the cost is lower.

[Says Brian](https://youtu.be/EfHPJK1TVmM):

<Pullquote citation="Brian Webster">
  We're noticing an amazing thing happening when we're pitching clients and they
  hear about this tech stack. And as a result we're actually seeing our S.O.'s
  winning a lot more bids. There's a project I think we're going to move forward
  on and our budget came in significantly less than their three competing bids.
</Pullquote>

Brian's prospective client even tried to ask his competition if they could match his approach. The competitors balked. If those shops don't adopt Gatsby, or something like it, they're going to lose a lot more business in the coming years.

That will not happen to me. And it doesn't have to happen to you. If you want to increase your margins and profitability, simplify your maintenance, and power-up your custom services, I invite you to try out Gatsby for your client projects.
