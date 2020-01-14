---
title: "Why Teams Using Gatsby Sleep Better At Night"
date: 2019-04-19
author: Sam Bhagwat
excerpt: "Learn how a Gatsby-powered architecture increases the reliability and scalabity of your website."
tags: ["cdn", "developer-experience", "performance"]
---

What&#39;s the least fun part of software development? Probably: pager duty.

2am wakeups. Alerts while at a bar with friends. False alarms. Worse, false _non_-alarms.

Preventing pages (and downtime!) is a top goal of any high-quality eng org. But it&#39;s hard. There&#39;s usually no silver bullet. Luckily, for websites, there is.

## Getting infinite scalability

True alerts have two potential causes: bugs, and scaling.

Bugs, or regressions, tend to be introduced in response to code pushes. Scaling or infrastructure issues, on the other hand, occur when a service you depend on goes down or when your app is experiencing levels or patterns of traffic that cause partial or total failures. Perhaps high traffic overwhelms your database and causes drastically higher load times or timeouts.

### Bugs are much easier to deal with than scaling issues.

When a bug goes into production and is flagged, it&#39;s usually the result of a code push, often during working hours. It can usually be solved by git bisect to identify the offending code commit, some careful analysis to find the specific incorrect lines of code, and either reverting to a &quot;known good&quot; state, or adding a 2-line fix. While this is never fun to do under the gun, it&#39;s usually fairly straightforward.

When your app is experiencing scaling issues, on the other hand, it usually instigates a whodunnit across the entirety of the infrastructure. Databases, caches, load balancers, proxies, routing and edge configurations, cloud infrastructure like AWS or Azure your team utilizes, third party scripts, plugins, and services -- everything comes under suspicion and is therefore guilty until proven innocent.

Meanwhile your entire engineering organization grinds to a halt as everyone who could potentially find the key bottleneck starts looking for it, and everyone else starts rubbernecking because the unfolding drama is _way more interesting_ than whatever else they were working on.

If you&#39;re building a website, puts an end to traffic-spike-induced downtime.

Gatsby sites are simply files that can be pushed to a CDN like Cloudflare or Netlify or AWS Cloudfront. And CDNs are much less likely to go down.

## A site that&#39;s always ready for your guests

Brian Webster, founder/CEO of the LA-based, design-focused agency Delicious Simplicity, compares how Gatsby builds the site ahead-of-time to being a good party host.

&quot;We think of our websites sort of as a big event or a big party and everyone coming to visit it are our guests,&quot; says Webster. &quot;So not pre-building and assembling web pages on the fly at request time would kind of be like the equivalent of setting up your party when your guests show up. Why would we doing that on their time?&quot;

&quot;As site owners, it&#39;s becoming more and more our responsibility to say, &#39;Hey, how much of this stuff can we get done before our guests show up?&#39; Especially when we know what they&#39;re going to come and look at. Which means if we&#39;re expecting 10 people at our party or 10 thousand people show up, we&#39;re equipped to scale.&quot;

In a world where website visitors are a source of revenue or donations, Webster points out, time is money, and traffic spikes from publicity, email newsletter blasts, should be taken advantage of rather than worried about.

Wester again:

&quot;We never want our best day to be our worst day -- the site going down, or becoming slow,&quot; he says. &quot;But with [Gatsby], everything&#39;s prebuilt. Scale is cheap, easy. I think that&#39;s just really great for your best day to be your best day and to get as many of those donations as you can.&quot;

## No more clearing caches and hoping for the best

Brad Redding, co-founder from digital agency &amp; analytics provider Elevar, has been building e-commerce sites for over a decade.

&quot;We&#39;ve had clients that are used to that aren&#39;t technical, who aren&#39;t skilled in HTML or CSS,&quot; Redding says.

&quot;If they actually update content, banners, or images, clicking the save or &quot;clear cache&quot; button could potentially take the site down. Because if you clear cache, a problem that hadn&#39;t surfaced yet, that comes to fruition and all of a sudden, checkout is broken or you could have a very funky UX error.&quot;

That creates an atmosphere of fear for clients, he says. &quot;Our ultimate goal is to remove that stress and that fear where you can&#39;t make updates to your site without having to live in fear of bringing down the site, breaking something, or impacting the user experience.&quot;

Elevar&#39;s VP Engineering Thomas Slade agrees. &quot;I came from an agency that builds a lot of Magento sites,&quot; Slade says. &quot;I&#39;m used to being in an environment where you&#39;re thinking about how to cache, you&#39;re thinking about servers, you&#39;re getting called late at night because the site is slow.&quot;

## Stress-free launch days

When lead developer Kennedy Rose took responsibility for Escalade Sports&#39; web stack, the first challenges he confronted were stability issues.

&quot;When I started, all of our sites were on Drupal,&quot; said Rose. &quot;The problem was that it wasn&#39;t stable. The sites all shared a core, and when the core went down, everything went down.&quot;

Successful marketing efforts created traffic spikes — but the technology stack couldn&#39;t keep up with demand.

&quot;Whenever we had a trade show, our sites would just go down,&quot; Rose said, &quot;We had to put a load balancer in front of multiple servers in order to keep it up. It just wasn&#39;t working—and when that happens after a trade show, you&#39;re just not getting your ROI.&quot;

As Webster put it, their best day had became their worst day.

The e-commerce razor brand Harry&#39;s sister brand ShopFlamingo picked Gatsby for a new product launch for exactly this reason.

Tim Brown, senior software engineer at Harry&#39;s explained. &quot;We&#39;ve had thousands of concurrent users on the site at once with no scaling concerns and zero performance impact.&quot;

It&#39;s even allowed them to onboard teammates to pagerduty rotation, and made that task much less of a chore.

&quot;We were able to allow newer teammates to be part of the on-call for the launch because Gatsby made it so easy to maintain,&quot; Brown says.

So when Webster, Brown, Slade, Redding, and Rose moved their commercial projects over to Gatsby, they didn&#39;t just get business results. They got sites that never went down -- and slept better at night.

_Brian Webster discussed more about his agency&#39;s journey on the webinar_ [_&quot;How to Equip Your Marketing Team for Success with Gatsby and Contentful&quot;_](/starlight-webinar/)_. Kennedy Rose shared his story on our blog at &quot;_[_Escalade Sports: From $5000 to $5/month in Hosting With Gatsby&quot;_](/blog/2018-06-14-escalade-sports-from-5000-to-5-in-hosting/). _Tim Brown shared Harry&#39;s story on the webinar_ [_&quot;Behind the Scenes: What makes Gatsby Great&quot;_](/behind-the-scenes/). _Brad Redding and Thomas Slade shared Elevar and Strivectin&#39;s story on the webinar_ [_&quot;Optimizing E-commerce with Gatsby.&quot;_](/optimizing-ecommerce-webinar/)
