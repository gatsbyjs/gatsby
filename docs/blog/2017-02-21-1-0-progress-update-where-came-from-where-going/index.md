---
title: What's coming in Gatsby 1.0
date: "2017-02-23"
author: "Kyle Mathews"
image: 'ui-and-code.png'
---

![GatsbyGram](ui-and-code.png)

Imagine for a moment the perfect website framework. One that produced
really fast sites by default, that let you use the latest web tools and
browser features without complicated setup, and that helped your team
stay coordinated as you develop, ship, and maintain sites.

This framework would have to be:

* **universal**, work for all types of sites from simple brocurewares to
complex webapps.
* **simple**, not requiring any setup to start using and with thoughtful
APIs to extend the framework.
* **fast**, doesn't lose customers to slow websites. Takes advantage of
HTTP/2, browser caching, service workers, inlined critical css, and code
splitting so your site always loads incredibly fast—no matter what you
build.
* **Javascript-driven**, the web is huge and intensely competative.
Sites that win are fast and richly interactive. Your framework must make
it trivial to use advanced Javascript.
* **team ready**, use industry standard collaboration tools like NPM,
Git, and continous deployment, so your team is always on the same page
and shipping new features is easy.
* **modular**, allows for cleanly seperated features so fixing bugs and
adding new features is easy and complexity is contained.
* **internet scale**, launch your site to millions without crashing your
site (or your wallet).
* **secure**, doesn't put your your users' data at risk of hacking.

I believe that Gatsby fulfills these requirements. After several years
of working on the project and seeing it used successfully by many people
on a wide variety of sites, I'm confident that Gatsby works.

Since I open sourced Gatsby in 2015, it's collected over **8000 stars**
on Github (by far the most stars on Github for a project of its type),
been joined by **122 contributors**, and **downloaded 130,000** times!

In mid-2016, I decided to [go full-time on
Gatsby](https://www.bricolage.io/gatsby-open-source-work/) and started
researching and prototyping ideas that are now coming together as Gatsby
1.0.

## What is Gatsby

Gatsby combines the fast performance of static websites with the
powerful abstractions, excellent tools, and clientside capabilities of
the webapp world.

It is a general purpose data-centric web framework and has been
successfully used for a wide variety of sites including blogs, marketing
sites, documentation sites, and ecommerce.

It wraps three of the most popular web app tools in a cohesive website
framework:

* React from Facebook for building UIs
* Webpack for bundling Javascript and CSS
* GraphQL from Facebook for querying data

When loading a Gatsby site, browsers first load an HTML file for a given
page and then load the minimum Javascript needed to make that page
interactive.

Static files ensure a much more *carefree deployment*. There are no
*complicated databases* to install and maintain or *webservers to scale* and
protect against hacking.

Serving static files ensures consistent *super fast load times*. And
once your site is loaded, Gatsby automatically *pre-fetches* adjacent
pages. This means navigating around your site feels *instantaneous* as
all the content for the next page has been loaded already. Since you're
reading this on a Gatsby site, try clicking on a link and then back
(note, this site is still being worked on as we approach 1.0). A bit
faster than your current site no? 😜

## Apps vs sites
From nearly the beginning of the web, the idea of the web as an
application platform has competed with the idea of the web as a series
of "documents".

In recent years, the "app" paradigm has gained steam as dozens of
Javascript frameworks and other Javascript tools have been released,
exploring ideas and competiting for mindshare.

100s of millions of dollars have been invested in these Javascript
frameworks and the larger ecosystems of tools surrounding them.

The improvement has been dramatic and excilierating. I can remember many
things I struggled for weeks to build in ~2010-2013 that took me days or
even hours once I'd adopted React.

React has taken over the web world and for good reason. Its three big
ideas, composable components, lifecycle APIs, and one-way data flow
dramatically *simplify* web UI development. Things that are really hard
to build within other paradigms feel almost easy with React.

## Time for a Javascript web framework?

The internet runs on Open Source CMSs—primarily Wordpress and Drupal.
Which are amazing ecosystems. I spent most of college building Drupal
websites and writing [open-source Drupal
modules](https://www.bricolage.io/first-beta-release-drupal-native-mailinglist-module/).
My first startup job was at [Pantheon](https://pantheon.io)—where I
helped [build developer tools](https://www.bricolage.io/new-beginnings/)
for teams building Drupal & Wordpress sites.

These open source CMSs are extrodinary ecosystems and truly run the web.
Wordpress alone runs more than 25% of all websites on the internet!

But still, the time seems ripe for a clientside-centric web framework.

More and more sites are expected to become app-like layering on more and
more Javascript. And the extrodinary advances in Javascript frameworks
and tooling has made webapp ideas approachable to any team. Gatsby has
the assumption that you will need a rich client baked deep into its
core. Gatsby bakes in modern Javascript compiler and bundling tools and
a full asset pipeline so you can just start writing your website.

My hope is it fuses the best ideas of the first few generations of the
web with the ideas and requirements of the next.

## Gatsby 1.0 — Growing the community and the tool

Build out theme and plugin system. Launch Gatsby themes, internal and
open source.

Theme with custom set of React components — all managed over NPM.

Read on for an intro to what's coming in 1.0.

### Code splitting

* per route
* one js heavy page doesn't affect other pages

### Service workers and offline support

* no work, no fuss, super fast.

### GraphQL data layer

* intro graphql
* avoid custom scripting, pull in exactly the data you need in client,
crystal clear how the component works.
* only runs at build-time.
* Know exactly what data is needed for each page so no waiting.
* push vs. pull

### Programmatic routes

* pagination, etc.

Show simple component.

## GatsbyGram case study

<div>
<video controls="controls" autoplay="true" loop="true">
  <source type="video/mp4" src="/gatsbygram.mp4"></source>
  <p>Your browser does not support the video element.</p>
</video>
</div>*GatsbyGram — our first 1.0
example site @ https://gatsbygram.netlify.com/*

Show how video demonstrates different ideas expressed above.
