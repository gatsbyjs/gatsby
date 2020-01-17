---
title: "Why Teams Using Gatsby Sleep Better At Night"
date: 2019-04-19
author: Sam Bhagwat
excerpt: "Learn how a Gatsby-powered architecture increases the reliability and scalabity of your website."
tags: ["cdn", "developer-experience", "performance"]
---

What's the least fun part of software development? Probably: pager duty.

2am wakeups. Alerts while at a bar with friends. False alarms. Worse, false _non_-alarms.

Preventing pages (and downtime!) is a top goal of any high-quality eng org. But it's hard. There's usually no silver bullet. Luckily, for websites, there is.

## Getting infinite scalability

True alerts have two potential causes: bugs, and scaling.

Bugs, or regressions, tend to be introduced in response to code pushes. Scaling or infrastructure issues, on the other hand, occur when a service you depend on goes down or when your app is experiencing levels or patterns of traffic that cause partial or total failures. Perhaps high traffic overwhelms your database and causes drastically higher load times or timeouts.

### Bugs are much easier to deal with than scaling issues.

When a bug goes into production and is flagged, it's usually the result of a code push, often during working hours. It can usually be solved by git bisect to identify the offending code commit, some careful analysis to find the specific incorrect lines of code, and either reverting to a "known good" state, or adding a 2-line fix. While this is never fun to do under the gun, it's usually fairly straightforward.

When your app is experiencing scaling issues, on the other hand, it usually instigates a whodunnit across the entirety of the infrastructure. Databases, caches, load balancers, proxies, routing and edge configurations, cloud infrastructure like AWS or Azure your team utilizes, third party scripts, plugins, and services -- everything comes under suspicion and is therefore guilty until proven innocent.

Meanwhile your entire engineering organization grinds to a halt as everyone who could potentially find the key bottleneck starts looking for it, and everyone else starts rubbernecking because the unfolding drama is _way more interesting_ than whatever else they were working on.

If you're building a website, Gatsby puts an end to traffic-spike-induced downtime.

Gatsby sites are simply files that can be pushed to a CDN like Cloudflare or Netlify or AWS Cloudfront. And CDNs are much less likely to go down.

## A site that's always ready for your guests

Brian Webster, co-founder of the LA-based Delicious Simplicity, compares how Gatsby builds the site ahead-of-time to being a good party host.

"We think of websites as a big event or party and visitors as our guests," says Webster. "So not pre-building and assembling web pages at request time would be the equivalent of setting up your party when the guests arrive. Why would we do that on their time?"

"As site owners, it's becoming more and more our responsibility to ask, 'Hey, how much can we get done before our guests get here?' Especially when we know what they might look at. In many cases, we may prebuild the entire website."

In a world where website visitors are a source of revenue or donations, Webster points out, time is money, and traffic spikes from publicity, email newsletter blasts, should be taken advantage of rather than worried about.

Webster again:
"We never want our best day to be our worst day - the site going down, or becoming slow," he says. "But with [Gatsby], everything's prebuilt. Scale is cheap, easy. If we're expecting 10 people at our party and 10 thousand show up, we're well equipped.

## No more clearing caches and hoping for the best

Brad Redding, co-founder from digital agency and analytics provider Elevar, has been building e-commerce sites for over a decade.

"We've had clients who aren't technical, who aren't skilled in HTML or CSS," Redding says.

"If they actually update content, banners, or images, clicking the save or "clear cache" button could potentially take the site down. Because if you clear cache, a problem that hadn't surfaced yet, that comes to fruition and all of a sudden, checkout is broken or you could have a very funky UX error."

That creates an atmosphere of fear for clients, he says. "Our ultimate goal is to remove that stress and that fear where you can't make updates to your site without having to live in fear of bringing down the site, breaking something, or impacting the user experience."

Elevar's VP Engineering Thomas Slade agrees. "I came from an agency that builds a lot of Magento sites," Slade says. "I'm used to being in an environment where you're thinking about how to cache, you're thinking about servers, you're getting called late at night because the site is slow."

## Stress-free launch days

When lead developer Kennedy Rose took responsibility for Escalade Sports' web stack, the first challenges he confronted were stability issues.

"When I started, all of our sites were on Drupal," said Rose. "The problem was that it wasn't stable. The sites all shared a core, and when the core went down, everything went down."

Successful marketing efforts created traffic spikes — but the technology stack couldn't keep up with demand.

"Whenever we had a trade show, our sites would just go down," Rose said, "We had to put a load balancer in front of multiple servers in order to keep it up. It just wasn't working—and when that happens after a trade show, you're just not getting your ROI."

As Webster put it, their best day had became their worst day.

The e-commerce razor brand Harry's sister brand ShopFlamingo picked Gatsby for a new product launch for exactly this reason.

Tim Brown, senior software engineer at Harry's explained. "We've had thousands of concurrent users on the site at once with no scaling concerns and zero performance impact."

It's even allowed them to onboard teammates to pagerduty rotation, and made that task much less of a chore.

"We were able to allow newer teammates to be part of the on-call for the launch because Gatsby made it so easy to maintain," Brown says.

So when Webster, Brown, Slade, Redding, and Rose moved their commercial projects over to Gatsby, they didn't just get business results. They got sites that never went down -- and slept better at night.

_Brian Webster discussed more about his agency's journey on the webinar_ [_"How to Equip Your Marketing Team for Success with Gatsby and Contentful"_](/starlight-webinar/)_. Kennedy Rose shared his story on our blog at "_[_Escalade Sports: From $5000 to $5/month in Hosting With Gatsby"_](/blog/2018-06-14-escalade-sports-from-5000-to-5-in-hosting/). _Tim Brown shared Harry's story on the webinar_ [_"Behind the Scenes: What makes Gatsby Great"_](/behind-the-scenes/). _Brad Redding and Thomas Slade shared Elevar and Strivectin's story on the webinar_ [_"Optimizing E-commerce with Gatsby."_](/optimizing-ecommerce-webinar/)
