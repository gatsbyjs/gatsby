---
title: "Why we choose Gatsby over Next.js and Wintersmith"
date: "2017-10-03"
image: "smartive-loves-gatsby.png"
author: "Moreno Feltscher"
excerpt: "At smartive we always saw the potential of static site generators. We recently made the switch to Gatsby.js for our company site. A decision we don’t regret. Here’s why."
---

_This article was originally published on
[our company blog](https://blog.smartive.ch/smartive-ch-goes-gatsby-js-27a056b3b817)
on September 27, 2017._

# smartive.ch goes Gatsby

At smartive, a Swiss-based web agency, we always saw the potential of static
site generators. After using Wintersmith and Next.js we recently made the switch
to Gatsby for our company site. A decision we don’t regret. Here’s why.

## Back in the Days..

As mentioned we already built our company website using static site generators
early on. Last year, we finally made the switch from our good old custom PHP
application with little to no logic, which served us for about two years, to
[Wintersmith](http://wintersmith.io/). At that time this was one of the leading
static site generators based on Node.js. Since most of our applications at that
time were already JavaScript based it seemed to be the perfect fit. The fact
that our company was undergoing a complete rebranding in terms of our corporate
identity came in quite handy as well.

After running Wintersmith for almost a year we encountered its limits. Some of
the major drawbacks at that time were:

* No code splitting, resulting in the client having to load a bunch of
  unnecessary JavaScript and CSS files
* Pulling in external resources, such as blog posts, was quite unhandy and
  sometimes even impossible
* Build process optimization was almost impossible and in our case resulted in a
  Webpack setup on top of Wintersmith which was not really maintainable

## React to the Rescue!

Since by the time we encountered the problems described above we already had
deep knowledge of React we started looking for an alternative based on that hot
new thing.

The first thing that caught our attention was
[Next.js](https://github.com/zeit/next.js/), as seemingly everyone going for a
server-side rendered React app was using it. After some days hacking on our app
we encountered some issues, especially when it came to frontend rendering. We
chose [prismic.io](https://prismic.io/) for our backend system which served all
the content. Although this felt right at first but, as all of us are developers,
working around the constraints of it just didn’t feel right.

Luckily at that time Gatsby version 1.0
[just got released](/blog/gatsby-v1/) and we decided to
give it a try during one of our so-called Hackdays. We instantly fell in love
with the simplicity of the system. Our first approach was to just use all the
components which we already had created for Next.js and backed it by simple JSON
files containing the content we wanted to serve using the amazing yet simple
GraphQL-based pull-in mechanism Gatsby provides. This was accomplished by using
the
[gatsby-transformer-json plugin](https://www.npmjs.com/package/gatsby-transformer-json)
internally. Keep in mind that our content rarely changes, so this was always the
way we wanted it to be (without knowing for some time as we had to admit to
ourselves).

One of our main goals all along was to show
[our latest blog posts](https://blog.smartive.ch) on Medium. Unfortunately at
that time there was no plugin to achieve this so we decided to write one
ourselves. By the time of writing I’m proud to say we successfully did so and
even
[contributed it back to the community](https://github.com/gatsbyjs/gatsby/pull/1907).
Make sure to check it out if you’re interested in a similar solution.

The only thing left was to actually rebuild and deploy our site once a new blog
post gets released on Medium. We chose [IFTTT](https://ifttt.com/) for this
task, mainly because of its simplicity. Every time IFTTT picks up a newly
published blog post it triggers a GitLab CI pipeline using a webhook, which then
rebuilds and deploys our application onto our Docker Cloud infrastructure.

The result of our work using Gatsby is an outstanding
[Google PageSpeed score](https://developers.google.com/speed/pagespeed/insights/?url=https://smartive.ch&tab=desktop)
thanks to the built-in code splitting and cache handling mechanisms. If you’re
interested in how [smartive.ch](https://smartive.ch/) is built you can have a
look at our code [on GitHub](https://github.com/smartive/smartive.ch).

We are really looking forward to build other cool stuff for our customers using
Gatsby!

---

If you have any questions about the way we built
[smartive.ch](https://smartive.ch) feel free to contact me on
[Twitter](https://twitter.com/luagsh_mrn).

_Special thanks goes to my co-worker [Robert Vogt](https://twitter.com/_deniaz)
who did most of the work on our website and contributed the Medium plugin
mentioned above._
