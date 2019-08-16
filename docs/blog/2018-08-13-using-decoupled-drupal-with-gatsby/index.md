---
title: Using Decoupled Drupal with Gatsby
date: 2018-08-13
author: Shannon Soper
tags: ["cms", "drupal"]
---

## Why use Drupal + Gatsby together?

Kyle Mathews is presenting on “Gatsby + Drupal” at [Decoupled Drupal Days NYC](https://2018.decoupleddays.com/session/decoupled-drupal-gatsby) this Saturday; for those who can’t make it to his presentation, we wanted to give you a sneak peek of what it will be about.

(Hint: it’s about how nicely Gatsby and Drupal work together!)

Take a look at the source code of [the official Gatsby + Drupal example site](https://github.com/gatsbyjs/gatsby/tree/master/examples/using-drupal) or [see it live](https://using-drupal.gatsbyjs.org/). Gatsby co-founder, Kyle Mathews, has a [long history with Drupal](/blog/2018-05-24-launching-new-gatsby-company/#drupal-and-the-lamp-stack) and built this example site in Gatsby’s early days:

![Screenshot of decoupled Drupal site build with Gatsby](umami-site.png)

[A delicious Gatsby + Drupal site](https://using-drupal.gatsbyjs.org/)

Using Drupal as a headless CMS with Gatsby is a great way to get an enterprise-quality CMS for free, paired with a great modern development experience and all the benefits of the JAMstack, like performance, scalability, and security.

It only takes a few steps to use Gatsby with Drupal as a headless CMS (also known as decoupled Drupal).

## How to implement Drupal + Gatsby

Hooking up Gatsby to a new or existing Drupal site takes just a few steps:

- Add the [`gatsby-source-drupal` plugin](/packages/gatsby-source-drupal/) to your Gatsby site
- Configure the plugin with your Drupal credentials & hosted URL
- Access all your Drupal data using GraphQL queries

## Why use Gatsby and Drupal together?

[“Decoupled Drupal”](https://www.acquia.com/drupal/decoupled-drupal) has become an increasingly popular approach to building enterprise-grade websites, and has the [full-throated support](https://dri.es/how-to-decouple-drupal-in-2018) of Drupal community leaders.
Using Gatsby in a decoupled Drupal setup allows your team to access the powerful content modeling and access workflow capabilities of Drupal 8, as well as the powerful UI creation & performance toolset of Gatsby.

## When is Drupal a great choice?

Many development teams, content teams, and client decision-makers are familiar with Drupal. Here are some scenarios in which Drupal is a great choice (and a few scenarios for which it’s not-so-great):

### Drupal is great for:

- Complex page layouts or content modelling with multiple sections per page
- Teams with multi-stage content creation and review processes
- Development teams who value using popular, open-source technologies

### Drupal is not-so-great for:

- Content teams who require a slick content editing experience
- Teams requiring the use of Drupal UI Kit

## Interested in learning more?

Using Gatsby together with Drupal offers a powerful, full-featured, open-source, and free alternative for expensive enterprise content management systems. To learn more:

- Read [a Drupal agency’s introduction to Gatsby](https://www.mediacurrent.com/what-is-gatsby.js/)
- Watch [Kyle Mathews’ presentation on Gatsby + Drupal](https://2017.badcamp.net/session/coding-development/beginner/headless-drupal-building-blazing-fast-websites-reactgatsbyjs)
- Get started with Robert Ngo’s [Decoupling Drupal with Gatsby tutorial](https://evolvingweb.ca/blog/decoupling-drupal-gatsby) and watch his [Evolving Web 2018 Drupal conference presentation](https://www.youtube.com/watch?v=s5kUJRGDz6I).
- [Get in touch with the team](https://www.gatsbyjs.com/contact-us)
