---
title: Speed up your time to interactive by delaying third party scripts
date: 2019-10-12
author: Kilian Valkhof
excerpt: "Delay loading scripts to lower your time to interactive by over 60%"
tags:
  - performance
  - seo
---

Gatsby does many things to get a website visible as fast as possible. But getting a website visible isn't the only interesting metric. There are others that, if you're not careful, can easily take much longer than needed. Even if your site still feels fast.

The metric this article focuses on is "[Time to interactive](https://developers.google.com/web/tools/lighthouse/audits/time-to-interactive)", which is the time it takes for all your initial scripts to run. This one is particularly interesting for a couple of reasons:

- It's not super noticeable when you use a website on desktop
- Scripts loaded asynchronously are counted towards this number (even though they're async, they're still loaded in sequence after a page load)
- It's a very important part of [Google's performance ranking](https://github.com/GoogleChrome/lighthouse/blob/master/docs/scoring.md). Because of the user impact, it's 5 times more important than the "[first meaningful paint](https://developers.google.com/web/tools/lighthouse/audits/first-meaningful-paint)", e.g. when something shows up on the screen. **5 times!**

These together might mean that you have a website that _feels_ fast under some circumstances, but Google will give you a penalty because it's slow.

To get an overview of how your site scores, you can use Lighthouse, either in your Chrome developer tools by going to the "Audits" tab, or by going to [web.dev](https://web.dev/measure). Lighthouse will test your site on a number of different metrics, such as accessibility, SEO (Search Engine Optimization), and best practices, but the one we're interested in is "performance".

## The performance metric

While the other metrics are also important, the scope of this article is on performance. By default, a Gatsby site will easily get a score in the 90s (out of 100), but this can quickly become lower as you add more scripts to the page, especially third party scripts.

Harry from [marketingexamples.com](https://marketingexamples.com/) linked me to a recent post of his on [SEO performance](https://marketingexamples.com/seo/performance) that mentioned the "Time to interactive" scoring and I decided to take another look at my website for [Polypane](https://polypane.rocks). I had checked it in the past and it had a good (90+) score, but I was pretty shocked when it came back and suddenly had a score of 63!

When looking at the performance data, the site's first meaningful paint took slightly over a second, but the time to interactive was _eleven seconds_. Yikes!

The reason for this was that I recently switched to [Segment](https://segment.com) (using [gatsby-plugin-segment-js](/packages/gatsby-plugin-segment-js/)) and was loading other scripts through that, like support chat and analytics. These scripts all counted towards my "time to interactive".

The SEO performance post included a tip from Dave of [ToDesktop](https://www.todesktop.com/) who has similar problems. His tip: Prevent loading the scripts until after a user has scrolled, along with some timeout to prevent [scroll jank](http://jankfree.org/).

By adding a timeout, your "Time to interactive" won't take these scripts into account. The user won't need your support widget in the first second of a page anyway, so this works well for everyone.. With any upside, there is always a downside: your [bounce rate](https://support.google.com/analytics/answer/1009409?hl=en) will become less accurate as the people that open your site, don't scroll and leave will never show up in your analytics.

Wanting to improve the performance rating of my own site, I forked the [gatsby-plugin-segment-js](https://github.com/Kilian/gatsby-plugin-segment-js) repository and set to work.

## Updating gatsby-plugin-segment-js

The way this solution works is as follows:

- Wait for the user to scroll
- Do a setTimeout for 1 second
- Wrap the call in a [requestIdleCallback](https://developer.mozilla.org/en-US/docs/Web/API/Window/requestIdleCallback), if available
- Then load the script

Adding the scroll timeout as mentioned in the Marketing examples blog post was quickly done. In Gatsby however, all subsequent pages are loaded without a page refresh. This meant that potentially, people could click through your site, never scroll, and the plugin would never get loaded. To make the technique work for Gatsby, the script also needed to load onRouteChange.

This led to an interesting set of requirements:

- The scripts should load only once
- They should load either after a scroll action, or after a page update
- To prevent jank there is a time delay before the load actually happens

Due to this time delay, it could happen that you load a new page, the countdown starts, and during this countdown, you also scroll. At that point in time, the scripts haven't loaded yet so the scroll event listener would _also_ trigger a new load.

To work around this, I added two locks to the Gatsby plugin:

- `segmentSnippetLoaded`, `false` by default and set to `true` after it's loaded.
- `segmentSnippetLoading`, `true` only between when the load function has been called and when it has finished.

Then, either on `scroll` or `onRouteChange`, we only call the load function if `segmentSnippetLoaded` is not true, and in the load function, we only continue if `segmentSnippetLoading` is not true. This prevents the function from being called at all after the first time the script has been loaded. If the function is called twice but we're still in the countdown time, nothing happens.

After implementing this on my own website, my performance score shot back up from 63 to 94 and I had an over 60% decrease in the time to interactive. Pretty good for a few lines of code.

There is currently a [PR](https://github.com/benjaminhoffman/gatsby-plugin-segment-js/pull/19) open to add a `delayLoad` option to gatsby-plugin-segment-js to enable this feature. Alternatively, you can build it from [my fork](https://github.com/Kilian/gatsby-plugin-segment-js).

## In closing

If you work on a laptop or desktop with a good internet connection, the Time to Interactive is not so noticable as "time before you see something on your screen", but it can have a big impact on your performance rating and interactivity, and because of that, your SEO. You should be extra careful when adding third party scripts to your page, and the best way to do that is to run Google Lighthouse. If you notice your Gatsby site has a bad performance score, make sure to check the Time to Interactive value. If it's very high, try loading scripts only after a user has interacted with your website.
