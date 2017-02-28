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
* **fast**, take advantage of HTTP/2, browser caching, service workers,
inlined critical css, and code splitting so your site always loads
incredibly fast—no matter what you build.
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

Since I open sourced Gatsby in 2015, it's collected over **8000** stars
on Github (by far the most stars on Github for a project of its type),
been joined by 122 contributors, and downloaded **130,000** times!

In mid-2016, I decided to [go full-time on
Gatsby](https://www.bricolage.io/gatsby-open-source-work/) and started
researching and prototyping ideas that are now coming together as Gatsby
1.0.

## What is Gatsby

Gatsby combines the fast performance of static websites with the
powerful abstractions, tools, and clientside capabilities of the webapp
world.

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
ideas, components, lifecycle APIs, and one-way data flow dramatically
*simplify* web UI development. Things that are really hard to build
within other paradigms feel almost easy with React.

## App vs. site paradigms — how to choose?

To long-time web developers, webapp people and their new tools can seem
arrogant. "We've been building for the web for decades with tried and
true tools. We produce really good work using Wordpress, Drupal, Jekyll
etc. What's the fuss?"

My response would be... perhaps you *are* in a great position. There are
many many sites that fit really well within the "document-centric
world with occassional Javascript enhancements" paradigm. If that's you,
then keep doing great work with your tools.

But here's some arguments for switching to the app paradigm and Gatsby.

### Can you build complex javascript apps with your current website framework?

Do you often struggle with Javascript-heavy client requests? Are you
tired of dealing with jQuery hairballs? Have you had to turn down work
for Javascript-centric sites that your team couldn't handle under budget?

jQuery is brilliantly designed around enhancing HTML documents. Like all
tools stretched beyond their designs, it breaks down as you start to
cross over into app-landia.

Document-centric tools like jQuery *can* (with sufficient skill) work
well for apps. But the really nice thing about building within the app
paradigm is that even a really complex document site is a fairly simple
webapp while a really complex javascript webapp isn't possible to
express in the document paradigm.

### One tool to rule them all

big advantage to using one tool for everything. Save on training costs,
etc. Perhaps you're already using React for web apps.

### Follow the money

Developer tools are built by companies building for the web. Every
company from the very largest on the planet to the smallest are adopting
React and investing heavily in making it better. Because Gatsby is built
on top of these tools, Gatsby gets better as the React ecosystem gets
better. My bet is React is here to stay and I think that should be your
bet too.

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
