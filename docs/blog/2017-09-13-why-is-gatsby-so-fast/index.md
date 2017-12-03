---
title: Web Performance 101—also, why is Gatsby so fast?
date: "2017-09-13"
author: "Kyle Mathews"
image: "reactnext-gatsby-performance.001.png"
showImageInArticle: false
typora-copy-images-to: ./
---

_I gave this talk last weekend at [ReactNext](http://react-next.com/) in Tel
Aviv. I spoke on the basics of measuring and improving web performance and how
Gatsby is designed so sites built with it are always very very fast._

_Slides to follow interspersed with notes._

![reactnext-gatsby-performance.001](reactnext-gatsby-performance.001.png)

![reactnext-gatsby-performance.003](reactnext-gatsby-performance.003.png)

![reactnext-gatsby-performance.004](reactnext-gatsby-performance.004-5314265.png)

![reactnext-gatsby-performance.008](reactnext-gatsby-performance.008.png)

I open sourced the initial prototype of Gatsby in mid-2015. A year later, post
failed startup, I went full-time on Gatsby as it seemed the most interesting and
potentially fruitful thing I could do. After ten months of work, I, along with
the 40 other contributors, released Gatsby v1. I'm currently working on a
Gatsby-related startup.

![reactnext-gatsby-performance.007](reactnext-gatsby-performance.007.png)

## Why is site speed so important?

DoubleClick ran a study on how site loading performance affected how people used
websites.

![reactnext-gatsby-performance.011](reactnext-gatsby-performance.011.png)

In other words, PEOPLE LEAVE YOUR SITE IF IT IS SLOW. Which, I'll guess, is not
what you want.

![reactnext-gatsby-performance.012](reactnext-gatsby-performance.012.png)

Slow loading sites tend to have many related performance problems.

![reactnext-gatsby-performance.013](reactnext-gatsby-performance.013.png)

## How to think about & measure performance?

Ok, I've convinced you that site performance is important. You perhaps already
have a site that you know is too slow. How to do you go about improving things?

Our first task is to understand how to measure website performance. Only then
can we make changes that we're confident are improving things.

Let's discuss two key website performance metrics that summarize the most
important parts of website performance. How quickly is your website visible
(Speed Index) and how quickly is your site usable (Time to Interactive—TTI).

![reactnext-gatsby-performance.015](reactnext-gatsby-performance.015.png)

![reactnext-gatsby-performance.016](reactnext-gatsby-performance.016-5314582.png)

[webpagetest.org](http://webpagetest.org) is _so_ good. I've run 100s if not
1000s of performance tests while working on sites and optimizing Gatsby.

![reactnext-gatsby-performance.021](reactnext-gatsby-performance.021.png)

## Performance tests on real websites

Let's dive into some tests I ran on webpagetest.org and see the Speed Index
score for some well-known sites.

Each test uses webpagetest's "Simple Testing" mode and the "Mobile - Regular 3G"
test configuration. This loads a website from a real phone in Virginia USA
(Motorola G gen 4) on a simulated 3G connection.

![reactnext-gatsby-performance.022](reactnext-gatsby-performance.022.png)

![reactnext-gatsby-performance.023](reactnext-gatsby-performance.023.png)

![reactnext-gatsby-performance.024](reactnext-gatsby-performance.024.png)

So CNN seems decent. Its Speed Index score is 8098 (these are milliseconds btw
so 8.1 seconds) and it gets some pixels on screen by 6.5 seconds. Not bad. Let's
look at the next site.

![reactnext-gatsby-performance.025](reactnext-gatsby-performance.025.png)

![reactnext-gatsby-performance.026](reactnext-gatsby-performance.026.png)

![reactnext-gatsby-performance.027](reactnext-gatsby-performance.027.png)

Hey nice! Its Speed Index score is 5568 so 2.5 seconds or so faster than CNN. It
also gets its first pixels on screen at a zippy 3 seconds but its Speed Index
score is hurt by it taking another _12 seconds_ to finish loading.

![reactnext-gatsby-performance.028](reactnext-gatsby-performance.028-5471130.png)

![reactnext-gatsby-performance.029](reactnext-gatsby-performance.029.png)

![reactnext-gatsby-performance.030](reactnext-gatsby-performance.030.png)

Washingtonpost.com gets its first significant paint at around 5 seconds but it
takes another _10 seconds_ to finish visually loading which hurts its Speed
Index score some.

![reactnext-gatsby-performance.031](reactnext-gatsby-performance.031.png)

![reactnext-gatsby-performance.032](reactnext-gatsby-performance.032.png)

![reactnext-gatsby-performance.033](reactnext-gatsby-performance.033.png)

Woah! **2365** Speed Index! gatsbyjs.org—stop making everyone look so bad! 😎

And notice how steep the visual progress line is. Gatsby knows where it's going
and gets there quick.

gatsbyjs.org starts rendering 2x faster than cnn.com and washingtonpost.com and
whereas downy.com starts rendering at the same time, its Speed Index is _2x_
gatsbyjs.org due to the 12 seconds it takes to finish loading.

![reactnext-gatsby-performance.034](reactnext-gatsby-performance.034.png)

I call slow TTIs the "silent killer" because it's obvious to most people when
your Speed Index is slow. But slow TTI expresses itself in a 100 different UX
frustrations which might not have an obvious source which is why this number is
so important to track.

![reactnext-gatsby-performance.035](reactnext-gatsby-performance.035.png)

![reactnext-gatsby-performance.036](reactnext-gatsby-performance.036.png)

![reactnext-gatsby-performance.037](reactnext-gatsby-performance.037.png)

Which is close to 1/2 of an eternity in web browsing time. And makes for a very
frustrating user experience. Tapping on things that don't respond scores very
high on the Annoying UX metric.

### Let's review our scores

#### Speed Index

* 8098 — CNN.com
* 5568 — downy.com
* 7649 — washingtonpost.com
* 2365 — gatsbyjs.org

#### Time to Interactive

* 32.1s — CNN.com
* 14.2s — downy.com
* 31.4s — washingtonpost.com
* 4.4s — gatsbyjs.org

![reactnext-gatsby-performance.038](reactnext-gatsby-performance.038.png)

Let's discuss some ways to improve performance.

![reactnext-gatsby-performance.039](reactnext-gatsby-performance.039.png)

Clickable
link—https://developers.google.com/web/fundamentals/performance/critical-rendering-path/

![reactnext-gatsby-performance.040](reactnext-gatsby-performance.040.png)

If it doesn't need done immediately, defer it.

![reactnext-gatsby-performance.041](reactnext-gatsby-performance.041.png)

![reactnext-gatsby-performance.042](reactnext-gatsby-performance.042.png)

We won't discuss code splitting in depth but the basic idea is _only load
JavaScript_ that is needed immediately on the initial landing page. Defer
loading JavaScript for other pages. Defer loading optional JavaScript for the
page (e.g. a widget down the page). And so on. The less JavaScript you load
upfront, the faster your users will able to start using your site.

![reactnext-gatsby-performance.043](reactnext-gatsby-performance.043.png)

There's plenty of in-depth resources you can Google for.

![reactnext-gatsby-performance.044](reactnext-gatsby-performance.044.png)

_…perhaps you were wondering when I'd get to this_

![reactnext-gatsby-performance.045](reactnext-gatsby-performance.045.png)

What is the magic here? How are Gatsby sites consistently so fast?

![reactnext-gatsby-performance.046](reactnext-gatsby-performance.046.png)

Most frameworks leave frontend performance to users to figure out. With Gatsby
it's fundamental.

![reactnext-gatsby-performance.047](reactnext-gatsby-performance.047.png)

![reactnext-gatsby-performance.048](reactnext-gatsby-performance.048.png)

![reactnext-gatsby-performance.049](reactnext-gatsby-performance.049.png)

![reactnext-gatsby-performance.051](reactnext-gatsby-performance.051.png)

![reactnext-gatsby-performance.052](reactnext-gatsby-performance.052.png)

![reactnext-gatsby-performance.053](reactnext-gatsby-performance.053.png)

![reactnext-gatsby-performance.059](reactnext-gatsby-performance.059.png)

![reactnext-gatsby-performance.060](reactnext-gatsby-performance.060.png)

I mean I _love_ performance but even I really don't want to be worrying about
this stuff when I'm pushing hard to finish up a project.

![reactnext-gatsby-performance.061](reactnext-gatsby-performance.061.png)

As browsers and tooling gets more sophisticated, "best practices" for building
the most performant website changes.

![reactnext-gatsby-performance.062](reactnext-gatsby-performance.062.png)

Even really large sites with dozens of engineers get things wrong all the time.
For an entertaining & informative examination of this, checkout
[Sam Saccone's blog](http://samsaccone.com).

![reactnext-gatsby-performance.063](reactnext-gatsby-performance.063.png)

![reactnext-gatsby-performance.064](reactnext-gatsby-performance.064.png)

![reactnext-gatsby-performance.065](reactnext-gatsby-performance.065.png)

![reactnext-gatsby-performance.066](reactnext-gatsby-performance.066.png)

![reactnext-gatsby-performance.067](reactnext-gatsby-performance.067.png)

Gatsby is a [metacompiler](https://en.wikipedia.org/wiki/Metacompiler) if you
will. It takes your site and from it compiles an optimized webpack/Babel
configuration for building the site. In addition, it generates a client runtime
to efficiently prefetch resources in the client so clicking around your site is
lightning fast.

![reactnext-gatsby-performance.068](reactnext-gatsby-performance.068.png)

As I was prepping for my talk, Tom Dale of Ember, conveniently made similar
points in
[his great blog post](https://tomdale.net/2017/09/compilers-are-the-new-frameworks/).

![reactnext-gatsby-performance.069](reactnext-gatsby-performance.069.png)

![reactnext-gatsby-performance.070](reactnext-gatsby-performance.070.png)

![reactnext-gatsby-performance.071](reactnext-gatsby-performance.071.png)

![reactnext-gatsby-performance.072](reactnext-gatsby-performance.072.png)

![reactnext-gatsby-performance.073](reactnext-gatsby-performance.073.png)

## Performance is hard. Let's make Gatsby do the work.

Building highly performant websites is a science in and of itself. Our goal with
Gatsby is to give you an approachable, highly productive modern development
environment that lets you concentrate on what matters to you—content, design,
and interactions—and we take care of turning your amazing site into the fastest
site possible.

If you've been waiting to try out React, Gatsby is a great place to start! If
you're struggling to make your React app fast, try switching to Gatsby! If
you're tired of using technology X to build websites and have a huge secret
crush on React, well, Gatsby is waiting with open arms 🤗

And lastly, _if you're a performance-obsessed engineer like me, come help build
Gatsby_ and improve the performance of thousands (numbers growing quickly) of
Gatsby sites on the internet.
