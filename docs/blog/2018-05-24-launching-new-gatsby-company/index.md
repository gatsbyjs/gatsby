---
title: Announcing new Gatsby Company
date: 2018-05-24
author: "Kyle Mathews"
tags: ["gatsby-inc"]
---

Together with my co-founder, [Sam Bhagwat](https://twitter.com/calcsam), I’m thrilled to announce the formation of [Gatsby Inc.](https://www.gatsbyjs.com/) Based on the open source project Gatsby I founded, Gatsby the company will make feature-rich and blazing-fast websites easier to build and run.

First of all, if you haven’t used Gatsby yet, what is it? Gatsby:

- is a blazing fast static site generator for React.js
- is a powerful and flexible modern website framework that simplifies every step of starting, developing and running websites
- helps you leverage open source innovations in the React, NPM, and Gatsby communities for your web projects
- lets you pull data into pages from WordPress, Drupal, Contentful, markdown—and any other data source you can imagine
- compiles and optimizes your site’s code to make your sites lightning fast—even on mobile

Gatsby is used by tens of thousands of developers and organizations and is downloaded nearly ½ million times per month.

Follow our [getting started instructions](/docs/) to try out Gatsby in less than 5 minutes!

I’ll get to the new company in a bit, but first, let me tell the story of how Gatsby came to be.

## Origins of Gatsby

### Drupal and the LAMP stack

I first tried web development 12 years ago during my sophomore year of college. I spent hours setting up PHP and MySQL on my laptop and was ecstatic when the iconic blue of Drupal finally appeared in my browser. Drupal v5 had just been released and I was proud to be learning the latest version of the top open source CMS. I clicked around the admin screens with awe and anticipation.

I spent 1000s of hours building websites with Drupal—I even attempted to build a startup based around Drupal after college. I spoke at several DrupalCons and participated heavily within the Drupal open source ecosystem.

### The emerging world of JavaScript applications

But after years of building Drupal sites, I started feeling the pull of the emerging world of JavaScript web applications.

Like most people, I was blown away when I first tried Gmail. How was an application running in my browser faster to load and use than my desktop email app?

During my years building Drupal sites, I’d occasionally cast envious eyes at apps like Gmail, wishing I could work on something like that. But I could never quite figure out how they worked. JavaScript was a second-class citizen in Drupal those days, and I spent 99% of my time writing PHP.

### Backbone.js/Node.js/NPM

Then, in late 2010, the initial version of Backbone.js was released. I started playing with it and got super excited because things finally clicked for me: this was how to build rich, real-time JavaScript apps. The next year, I started my first full-time software development job at [Pantheon.io](https://pantheon.io/) and had a fantastic time building the Pantheon dashboard with Backbone.js to support Drupal & WordPress developers. I attended Backbone.js meetups and the first few Backbone.js conferences. Developer excitement online and at meetups was palpable. We could all feel that the world of web applications was starting to change dramatically.

Node.js, then only a couple of years old, was gaining traction fast. For the first time, NPM enabled the easy sharing of JavaScript libraries. Consequently, the number of libraries exploded. With a server runtime and ecosystem developing around JS, more and more web development tools started being written in JavaScript.

The fast paced world of the web was reinventing itself again.

### First exposure to cloud-native software engineering

Working at Pantheon was my first exposure to modern software engineering techniques like microservices, stateless services, 12-factor applications, Chef, Docker, Heroku, cheap development environments that mirrored production, continuous integration and deployment, atomic deploys and easy rollbacks with dreams of canary deploys and feature flagging. [Product Development Flow](https://www.amazon.com/Principles-Product-Development-Flow-Generation/dp/1935401009) became my bible.

I was hooked on being able to ship production code so quickly. Life was good.

### React.js

Then in 2013, React.js was released.

I first heard about React from [David Nolen’s blog post introducing his ClojureScript wrapper of React Om](http://swannodette.github.io/2013/12/17/the-future-of-javascript-mvcs). I was completely fascinated by his analysis; his identification of DOM manipulation code as a major contributor to application complexity and slowdowns resonated with me. I started reading everything I could find on React and soon became a huge fan.

Early in 2014, I left Pantheon to explore new opportunities. I dove deeper into React and built a number of sample applications and was astounded at how productive I was. Problems that used to take me weeks to solve in Backbone.js took me hours in React.js. Not only was I productive; my code felt remarkably simple. With Backbone.js, I always felt I was one or two slip-ups from the whole application spiraling out of control. With React, elegant and simple solutions seemed to come naturally from using the library. Again, I could feel things in web land were changing in a very big way.

### Distributed computing & event sourcing

A friend and I decided to work on a startup idea using React to build data-driven landing pages for sales reps.

During this time, I read two articles that had an enormous impact on me—“[The Log: What every software engineer should know about real-time data's unifying abstraction](https://engineering.linkedin.com/distributed-systems/log-what-every-software-engineer-should-know-about-real-time-datas-unifying)” and “[Turning the database inside-out with Apache Samza](https://www.confluent.io/blog/turning-the-database-inside-out-with-apache-samza/).” Databases and distributed systems finally clicked for me, and I obsessed over how to implement event sourcing for my startup. The latter article’s elegant critique of caching as an inevitable source of bugs and complexity and its suggestion to use materialized views generated through event sourcing sunk deep.

The traditional batch processing mode of computing—which reached its pinnacle with Hadoop—was taking heavy criticism as more and more applications demanded real-time data processing. The era of Big Data had arrived as the volume of data rolling through systems reached stratospheric levels at large numbers of companies. Kafka and stream processing frameworks like Spark were getting lots of attention.

### Designing and launching the initial version of Gatsby

Meanwhile, I was having lots of fun in my startup optimizing my landing pages. I added server side rendering and a number of other really fun performance tweaks while poring over reports from [webpagetest.org](http://www.webpagetest.org/). Universal JavaScript had arrived and was amazing.

We reached the point where we needed a website for the startup and after having focused on web apps for so long, all of the solutions in the content website world felt out of date.

Spinning up a local DB & server felt like a return to 2006, while template-based site generation felt far inferior to React’s elegant component model.

After some exploration with React server rendering for our app, I realized that React could actually be used as the basis for a static site generator. I got really excited about the potential and started scribbling notes in my notebook from time to time. Eventually, I took a week to build this out and launched Gatsby in late May 2015.
To my surprise and delight, people started using Gatsby almost immediately after I open sourced it. I spoke about Gatsby at the React conference in January of 2016 and was surprised at how many people knew about it and were using it.

### Growing momentum—can Gatsby be much much more?

Like most open source projects under heavy use, it started getting feature requests. One of the most common requests was how to scale Gatsby to larger sites as well as how to integrate Gatsby with CMSs like WordPress, Contentful, Drupal, and others. I had assumed people just used static sites for markdown or JSON driven sites, but as it turned out, there was a large group of developers interested in pushing the boundaries of what static sites can do.

These developers realized that the scaling and performance challenges faced by traditional CMS-driven sites was difficult to resolve without a new way to build websites. They had watched database-driven sites fail under heavy loads, and had seen slow, unoptimized websites drive away potential visitors.

They also like static sites generators because they easily leverage modern engineering ideas like Git, cheap development environments, continuous integration and deployment, open source innovations, modern JavaScript tooling and frameworks that dramatically improve productivity and developer happiness.

Static sites let you focus on what’s unique to your site—components, data structures, and design.

### Limitations of static site generators

But static sites, despite how much developers love them, have never gained widespread usage. They have real limitations in real-world use cases—they can’t handle frequent content updates and can’t scale to large and complex sites.

### Rebuild Gatsby on a stream processing architecture to eliminate the build step

As I thought deeply about this problem, it occurred to me that there were strong parallels between this problem and everything I’d learned about event sourcing and building cloud-native applications.

<blockquote class="twitter-tweet" data-lang="en"><p lang="en" dir="ltr">Static sites are the materialized views of websites.</p>&mdash; Kyle Mathews (@kylemathews) <a href="https://twitter.com/kylemathews/status/825512417337544705?ref_src=twsrc%5Etfw">January 29, 2017</a></blockquote>
<blockquote class="twitter-tweet" data-lang="en"><p lang="en" dir="ltr">Event sourcing potentially fantastic model for static site builder. Continually rebuilding website on events.</p>&mdash; Kyle Mathews (@kylemathews) <a href="https://twitter.com/kylemathews/status/825513977329307648?ref_src=twsrc%5Etfw">January 29, 2017</a></blockquote>

I realized you could view a website as the current computed state of a long stream of content and code changes. When viewed through that lens, the architecture became clear for a new version of Gatsby that would glue Gatsby to various data sources & solve the really hard problems of static sites: fast incremental builds and parallelizing builds for large and complex sites.

This architecture would enable Gatsby to eliminate the build step entirely—any code or content change would be quickly incorporated into the site and go live immediately. We could port the ideas of real-time event processing to building websites.

<blockquote class="twitter-tweet" data-lang="en"><p lang="en" dir="ltr">Building for the web in the future will revolve entirely around thinking about design and data structures.</p>&mdash; Kyle Mathews (@kylemathews) <a href="https://twitter.com/kylemathews/status/916165920359198720?ref_src=twsrc%5Etfw">October 6, 2017</a></blockquote>
<blockquote class="twitter-tweet" data-lang="en"><p lang="en" dir="ltr">Everything else can be automated</p>&mdash; Kyle Mathews (@kylemathews) <a href="https://twitter.com/kylemathews/status/916165988772487168?ref_src=twsrc%5Etfw">October 6, 2017</a></blockquote>

### Launching new version of Gatsby

So with my mind buzzing with ideas and possibilities, in late summer 2016, I plunged into work on the new version of Gatsby.

I posted my plans on GitHub and with help from 100s of developers in the community, we spent 10 months building out the new version of Gatsby which we released in July of 2017 with plugins for markdown, WordPress, Contentful, and others.

## Gatsby, a company for automating websites

After spending fall 2016, and most of 2017 consulting with companies around Gatsby and interacting with 100s of developers in the open source world, I started feeling confident that it was time to create a company devoted to bringing the full vision of Gatsby to fruition. My longtime best friend and Gatsby core contributor Sam Bhagwat and I started chatting about forming this startup to bring Gatsby to the world.

We were lucky to find some great investors, led by [Dan Scholnick of Trinity Ventures](http://www.trinityventures.com/team/dan-scholnick/), who shared our vision for new cloud-native website infrastructure and has extensive experience investing in and working with open source & cloud infrastructure startups like New Relic, Docker, Meteor, InfluxData and more, to back us with \$3.8M in seed funding.

I want to emphasize that this new startup doesn’t signal any move away from open source. I’ve been heavily involved in open source communities since I started programming 12 years ago and strongly believe it’s the best way to build software. We will be building cloud services for Gatsby but Gatsby itself will remain 100% open source as will most of what we intend to do. What the investment and company will enable is a much larger amount of effort towards improving Gatsby core and its surrounding ecosystem. Several core contributors have already joined to work full-time on Gatsby. We’ve been able to work with upstreams to make targeted improvements that benefit not just Gatsby but the whole frontend ecosystem. And as our company grows, we’ll be able to proportionally increase our investment in open source.

Gatsby, the company, is just getting off the ground, but, since the open source project is widely used, we wanted to talk about it now vs. keeping it a secret. If you’re a company exploring building some of your websites with React and headless CMSs, we would love to talk with you. If you are an engineer interested in helping us build the the future of web development, we’d love to talk with you as well.

It’s been an amazing journey so far. Wish Sam and I and our new colleagues luck on this new adventure.

### Learn more about Gatsby

- [From the New Stack "GatsbyJS, the Open Source React-Based SSG, Creates Company to Evolve Cloud-Native Website Builds"](https://thenewstack.io/gatsbyjs-the-open-source-react-based-ssg-creates-company-to-evolve-cloud-native-website-builds/)
- [gatsbyjs.com](https://www.gatsbyjs.com)
- [gatsbyjs.org](/)

_Also participating in Gatsby's funding round: Fathom Ventures, Robin Vasan, Mulesoft founder Ross Mason & the Pantheon founding team (Zack Rosen, Josh Koenig, Matt Cheney and David Strauss)._
