---
title: "Web Performance 102: Keeping Gatsby Sites Blazing Fast"
author: Dustin Schau
date: 2018-10-03
image: images/rocket.jpg
showImageInArticle: false
tags: ["performance", "v2", "lighthouse"]
---

We say it all the time: Gatsby sites are blazing fast.

It’s a great tagline. But for you, that might raise more questions:

- What’s the value in being blazing fast?
- How do you know it’s blazing fast?
- How can it be even more blazing (incineratingly?) fast?

These are questions the Gatsby core team has thought about recently, since our recent release of Gatsby v2 improved upon Gatsby v1's gold standard to squeeze even more performance out of every site.

And what are some simple, meaningful metrics to _know_ if your site is blazing fast?

Let's get to it.

<Pullquote>
  At the BBC, 10% of users are lost for every additional second the site takes
  to load.
</Pullquote>

## Measuring Speed

It can oftentimes be overwhelming and exhausting to truly _know_ all the performance optimizations and [web performance acronyms][web-perf] that are helpful to make your site blazing fast. H/2, PRPL, RAIL, FLIP, SPA, SW, TTI, oh my! Gatsby internalizes many of these practices so that you get _for free_ a blazing fast site with smart defaults out of the box. It's valuable to show rather than tell, so let's go over some performance monitoring tools and techniques so that you can learn how to measure the speed of your site and measure your site's performance. In particular, I'll go over two tools: Lighthouse and WebPagetest, and two metrics, Time to Interactive (TTI) and Speed Index. Armed with the knowledge of these tangible metrics and tools you can empower yourself to _know_ whether your site is actually blazing fast — or merely an imposter.

### Lighthouse / Google Audit

[Lighthouse][lighthouse] is an excellent tool provided by Google Chrome. It's built into the Chrome browser itself, so there's no reason to _not_ use and explore the excellent provided functionality.

Lighthouse measures your site's speed and performance on a variety of meaningful criteria including: performance, progressive web app functionality (e.g. service workers, offline functionality, etc.), accessibility, best practices, and search engine optimization. These core measurements, when maximized, give strong evidence that your site is performant, following the latest web performance techniques, and you know, _actually_ fast.

Our baseline is going to be Gatsby v1. I've created a [repository][gatsby-v1-repo] that I've then [deployed to Netlify][gatsby-v1-netlify]. To use Lighthouse, simply open up Chrome's Developer Tools and navigate to the Audits tab, like so:

<video controls="controls" autoplay="true" loop="true">
  <source type="video/mp4" src="/lighthouse.mp4" />
  <p>Your browser does not support the video element.</p>
</video>

Chrome will simulate a slower, mobile device, and measure the performance of your site on the criteria previously mentioned. Of particular note is the trace, which takes screenshots of your site as it loads. The less blank white screens your users see, the better. The quicker your site loads in this trace, the happier your users will be as your site is _actually_ blazing fast and a joy to use.

Maximizing this trace coupled with a concept known as TTI, or Time to Interactive, means that not only does your site load fast, but that it is able to be accessed and actually _used_ quickly too. If your site shell and content loads quickly, but JavaScript and other resources are still blocking the main thread, your users will leave your site and/or grow frustrated! Blazing fast isn't just the appearance of loading fast, it's loading fast coupled with actually _being_ fast, and TTI is a great metric to consider as a performance baseline.

Running a performance audit on a Gatsby v1 site gives us these results in Lighthouse:

![Gatsby v1 Lighthouse](./images/lighthouse-v1.png)

💯 Pretty speedy! We had our work cut out for us in improving upon this standard, but we did 💪

It's also pertinent to discuss Speed Index when discussing performance measurements. Speed Index is ["... the average time at which visible parts of the page are displayed."][speed-index] In effect, Speed Index gives us an idea how fast the separate pieces of our page are loaded and filled in. A page that loads disparate elements--e.g. the header, page content, sidebar, etc.--more quickly is a page that gives your user the sense of a fast-loading page. Couple a quick speed index with a blazing time to interactive, and you have a page that not only gives the appearance of loading quickly but one that is also _ready to use_ quickly. This is the gold standard we strive for at Gatsby.

Lighthouse is an excellent tool for providing _evidence_ that your site is fast, and it does so by using local emulation and simulation of slow networks and slower devices, e.g. CPU throttling. However, to really _know_ that your site is fast, there's no replacing testing on a real device, which is where an excellent tool [WebPagetest][webpagetest] is valuable.

### WebPagetest

WebPagetest allows you to collect performance measurements in running on a _real_ device, e.g. a Moto G on a Fast 3G connection. In other words, it allows you to test your site with real-world devices and real-world network connections, the value of which can't be overstated! WebPagetest is to Lighthouse what end-to-end tests are to integration tests. Both are valuable, but sometimes it's nice to _know_ your web page's performance in real-world conditions, and WebPagetest provides a means to accomplish that task.

![WebPagetest](./images/webpagetest.png)

Running a test in WebPagetest will pull up the specified site on the browser/network specified, and then collect performance measurements that can be reviewed and analyzed. These tests can serve as a baseline that can be compared against after changes are made, e.g. like a change in comparing the Gatsby v1 site to the Gatsby v2 site 🤓 Additionally, it's helpful to run these tests fairly often after meaningful changes and features are added to your web site, to ensure that you're guarding against performance regressions! For your consideration, check out Gatsby v1's metrics in WebPagetest.

[![WebPagetest v1](./images/webpagetest-v1.png)][webpagetestv1-results]

Armed with the powerful combo of Lighthouse, WebPagetest, and a knowledge of some useful performance terms like TTI, we can now shift into a discussion of the changes in Gatsby v2 that _improve_ performance over Gatsby v1 in meaningful, real-world ways. We'll come back to both of these tools as it relates to the Gatsby v2 site to actually _prove_ that we've improved performance over our Gatsby v1 baseline!

## Improving upon Gatsby v1

Gatsby v1 was in many ways an experiment to prove out some meaningful ideas:

- Injecting content at _build time_ from remote data sources with GraphQL
- Statically rendering React components to HTML to maximize performance and SEO
- Static site generation _and_ app-like functionality with React hydration
- A pluggable and extensible architecture to augment and enhance Gatsby's base feature set and give Gatsby superpowers.

[Pull data from WordPress at build time][gatsby-source-wordpress]? Sure. [Author your application in TypeScript][gatsby-plugin-typescript]? Seems reasonable. All this while maintaining sane and optimized defaults to truly squeeze every ounce of performance out of your application.

Gatsby v2 set out to build upon this solid foundation, while focusing on improvements in speed and developer experience.

### Speed improvements

It's not 🚀 science. Shipping less JavaScript to your end users makes your application faster to load, parse, and use. Think _hard_ whether that slick launch animation and heavy above the fold hero image are actually _meaningful_ to the quality experience your users want. Every additional byte of JavaScript has an associated parse and evaluation time that you're forwarding along to your end users.

<Pullquote citation="Addy Osmani">
  As much as I love JavaScript, it’s always the most expensive part of your
  site.
</Pullquote>

To that end, Gatsby v2 ships 31% less JavaScript in its client runtime. While we'd _love_ to brag about this, most of the credit goes to smart optimizations in libraries we rely upon: React--upgrading from 15 to 16--and @reach/router--swapped in place of react-router. Much like performance optimizations, build upgrades, etc. are available for free in something like [create-react-app][create-react-app], these upgrades in Gatsby v2 are available _for free_ simply by updating to Gatsby v2 by following the [migration guide][migration-guide]. The power of opinionated, optimized toolsets that internalize smart defaults!

| Version |  React   |  Router  |  Total   |
| :-----: | :------: | :------: | :------: |
|   v1    | `49.8kb` | `18.4kb` | `68.2kb` |
|   v2    | `34.8kb` |  `6kb`   | `40.8kb` |

## Bringing it home

Let's take another look at performance in Gatsby v2 by revisiting our trusty friends Lighthouse and WebPagetest. Refer to [the repo][gatsby-v2-repo] and [deployed site][gatsby-v2-netlify] to judge for yourself!

### Lighthouse

![Gatsby v2 lighthouse](./images/lighthouse-v2.png)

![Comparison](./images/lighthouse-chart.png)

_Oncemore: lower is better 😉_

### WebPagetest

[![Gatsby v2 WebPagetest](./images/webpagetest-v2.png)][webpagetestv2-results]

| Version | Speed Index | Time to Interactive |
| :-----: | :---------: | :-----------------: |
|   v1    |  `1.787s`   |      `2.532s`       |
|   v2    |  `1.657s`   |      `2.457s`       |

We've shaved off ~75ms from Time to Interactive, while also improving the Speed Index score 💪

## Wrap Up

Gatsby v2 is an iterative approach to improving the solid foundational base that was Gatsby v1. By upgrading your site, you can fully realize these performance benefits and deliver that blazing fast experience your users want, need, and expect. You've learned some tangible ways to measure performance so you can _prove_ for yourself that your site is as fast as it should be. Finally, you’ve learned in more depth about some of the changes and improvements that will be available merely by upgrading to Gatsby v2. [Follow our migration guide and update today][migration-guide] to see for yourself!

[web-perf]: https://github.com/google/WebFundamentals/blob/master/src/data/glossary.yaml
[speed-index]: https://sites.google.com/a/webpagetest.org/docs/using-webpagetest/metrics/speed-index
[lighthouse]: https://www.google.com/search?q=google+audit&ie=utf-8&oe=utf-8&client=firefox-b-1-ab
[gatsby-v1-repo]: https://github.com/dschau/gatsby-v1
[gatsby-v1-netlify]: https://gatsby-v1-perf.netlify.com/
[gatsby-v2-repo]: https://github.com/dschau/gatsby-v2
[gatsby-v2-netlify]: https://gatsby-v2-perf.netlify.com/
[gatsby-source-wordpress]: /packages/gatsby-source-wordpress
[gatsby-plugin-typescript]: /packages/gatsby-plugin-typescript
[migration-guide]: /docs/migrating-from-v1-to-v2/
[webpagetest]: https://webpagetest.org
[webpagetestv1-results]: https://www.webpagetest.org/result/181003_VD_1f8cbe4e27749d9725031de0be11c677/
[webpagetestv2-results]: https://www.webpagetest.org/result/181003_X2_97d4ff779e4dafae2734af0e7dd7d70f/
