---
title: Gatsby Gazette for July 2020 - This Website is Actually a Cake 🍰 Edition
date: 2020-08-03
author: Hashim Warren
excerpt: "Learn about July's product, community, and ecosystem updates. This includes new Gatsby Themes, a new enhanced WordPress integration, and an update to Incremental Builds"
seoTitle: Gatsby Product Updates for July 2020
tags: ["gatsby-gazette"]
---

July was full of ordinary items [revealed to be cakes 🍰](https://www.esquire.com/entertainment/tv/a33313974/cake-meme-explained/), and extraordinary websites powered by Gatsby Themes!

It’s been a year since we unveiled [Gatsby Themes](/docs/themes/what-are-gatsby-themes/) and celebrated the release with “Theme Jam”, a hackathon that produced dozens of [powerful and beautiful projects](https://themejam.gatsbyjs.org/showcase). A Gatsby Theme is like a Gatsby plugin that includes a gatsby-config.js file, and can add pre-configured functionality, data sourcing, and/or UI code to Gatsby sites. In the beginning we saw most developers focus on the UI capabilities of themes. A year later we see themes package, split, and combine functionality for every common website use case you can think of! [Search “theme” in the plugins directory](https://www.gatsbyjs.org/plugins/?=theme) to discovery over 400 Gatsby Themes you can use for your own projects.

July was also a huge month for official Gatsby Themes. We [updated our popular Blog Theme to 2.0](/blog/2020-07-08-blog-2.0/) and introduced better image support, search engine optimization, webfont configuration, and more. We also made it easier to swap styles for your blog, using Theme-UI presets. Don’t be fooled by the name “blog” though. This theme is the perfect add-on for any site that needs to continually publish content. The lead engineer on the theme, [Laurie Barth](https://laurieontech.com/) also revamped [the step-by-step Gatsby Blog Theme tutorial](https://www.gatsbyjs.org/tutorial/using-a-theme/), so you can get started customizing this theme quickly.

Also this month, we released a new official theme for adding [i18n support to your Gatsby site](https://www.gatsbyjs.org/blog/2020-07-28-introducing-gatsby-i18n-theme/)! This i18n theme gives you access to specialized React components that help with building a multilingual site. The lead developer on this theme, [Lennart Jörgens](/https://www.lekoarts.de/) also created 3 “child themes” for popular translation libraries. The i18n theme is great to use for any project that requires localization, but is also a solid example to study if you want to [build your own Gatsby Theme](/tutorial/building-a-theme/).

## 🚀 New in Gatsby and Gatsby Cloud!

### Gatsby Cloud Workspaces

Also in July we shipped Workspaces, a major improvement to how you can use Gatsby Cloud. New sites can be added to a Workspace from any repository or organization in GitHub, not just your own. And now you can create new Workspaces with separate subscriptions, giving you the flexibility to organize your sites to match your needs (especially when you need to set up a client’s account for them). [Sign up to Gatsby Cloud for free](https://www.gatsbyjs.com/dashboard/signup) to give Workspaces a spin.

### Enhanced WordPress Integration with Gatsby Cloud

Gatsby [released the BETA](/blog/2020-07-07-wordpress-source-beta/) of our new source plugin for WordPress, and it comes packed with lots of new features and improvements. Your Content Editors will love the integration with Gatsby Cloud, including Gatsby Preview and [near real-time builds](https://willit.build/details/type/blog/source/wordpress/page-count/512). Even if you haven’t built a website with WordPress before, we think this new source plugin will make the Gatsby / [headless WordPress](/docs/glossary/headless-wordpress/) stack a joy to experiment with.

### Faster Builds for Sites Using Static Queries

Previously [static query](https://www.gatsbyjs.org/docs/static-query/) results in Gatsby were imported as JSON by webpack. This means that static query results were included in your site's JavaScript bundles. With this change static query results are instead loaded by the Gatsby runtime and now live outside of the webpack pipeline. The result? Much faster builds for your site, if it uses static queries.

### Improved Architecture for Gatsby

[This change](https://github.com/gatsbyjs/gatsby/pull/25716) is a rewrite of the way the `develop` command runs a build. It coordinates the process, replacing lots of watchers and events spread throughout the codebase with one central state machine that handles the process. This new architecture prevents lots of race conditions and subtle bugs, and opens the door for many new possibilities 😉.

## 👩🏽‍🚀 New from the Gatsby Team

[Marcy Sutton](https://marcysutton.com/) interviewed web perf consultant Tim Kadlec on Twitch about “[Improving Gatsby Site Performance](https://www.twitch.tv/videos/695416111)”. The tips for how to interpret Lighthouse scores are mind blowing, and well worth your watch time.

[Ben Robertson](https://benrobertson.io/) presented a Gatsby/Drupal case study at DrupalCon. [See his slides](https://noti.st/benrobertson/pfuJPT/magmutual-com-on-the-jamstack-with-gatsby-and-drupal-8).

[Shane Thomas](https://twitter.com/smthomas3) also spoke at DrupalCon about “Building a Compelling Content Experience with Gatsby & Drupal”. [See his slides](https://docs.google.com/presentation/d/1IWAlrTs3ODLVd0k2UMLA5_0fF_ukvDTrrEE43M65De8/edit#slide=id.g854bc15f1e_0_25).

[Obinna Ekwuno](https://twitter.com/Obinnaspeaks) appeared on “That’s My JAMstack” and spoke about [how Incremental Builds with Gatsby Cloud](https://thatsmyjamstack.com/posts/obinna-ekwuno/) works.

## 🌍 New from the Gatsby Community

[Alexandra Spalato](https://alexandraspalato.com/) and [Paulina Hetman](https://pehaa.com/) appeared [on the Party Corgi Podcast](https://party-corgi-podcast.simplecast.com/episodes/the-first-commercial-gatsby-wordpress-themes-with-alexandra-spalato-and-paulina-hetman) to talk about making premium [Gatsby Themes for WordPress](https://gatsbywpthemes.com/). We’ve seen a sneak peek of their work, and both the Gatsby and WordPress communities are going to be blown away by these projects 🚀.
https://twitter.com/partycorgipod/status/1288087382504419335

[Matías Hernández Arellano](https://matiashernandez.dev/) authored an Egghead course on creating a Gatsby source plugin. You can watch it in [English](https://egghead.io/playlists/creating-a-gatsby-source-plugin-3f01) or [in Spanish](https://egghead.io/playlists/creacion-de-un-plugin-de-gatsby-desde-cero-5c8b).

Arshad is back with another Gatsby Theme for to his growing [ReflexJS](https://reflexjs.org/) collection. This new theme adds a video section to your site, and is optimized with SEO, OG and Twitter metatags. Reflex also comes with beautiful, [ready-to-use components](https://reflexjs.org/library/blocks) so you can customize the style and layout of your site quickly.

![Reflex screenshot](./reflex.png)

[Wojciech Kocjan](https://kocjan.net/)'s "Intro" theme crossed a major milestone in July with 1,000 downloads 🎉. If you need a well-designed and simple resume and portfolio site, [spin up Intro](https://github.com/wkocjan/gatsby-theme-intro).

## 🪐 New from the Gatsby Ecosystem

### Rewrite of GraphCMS’s source plugin

We helped GraphCMS build their new source plugin ([using our new GraphQL toolkit](http://github.com/vladar/gatsby-graphql-toolkitgithub.com/vladar/gatsby-graphql-toolkit)). Head to the repo, and [give it a try](https://github.com/GraphCMS/gatsby-source-graphcms/).

### Strapi's Gatsby Blog Starter

[Strapi released a gorgeous blog starter](https://strapi.io/blog/strapi-starter-gatsby-blog-v2) that you can use with their headless CMS with minimal setup. [Watch the demo on YouTube](https://youtu.be/wsFuSebpv0I).

### Ink v3

Ink, a project that enables you to build command-line apps using React [released version 3](https://vadimdemedes.com/posts/ink-3), a major upgrade. We use Ink for Gatsby's CLI, so you will soon features from this update flow into our project. If you ever wanted to build a CLI yourself, and you know React, [give Ink a try](https://github.com/vadimdemedes/ink).

## 💫 Next from Gatsby

### New alpha for Gatsby Recipes

In the coming weeks look out for exciting updates to [Gatsby Recipes](/blog/2020-04-15-announcing-gatsby-recipes/), our new [infrastructure-as-code](docs/glossary/infrastructure-as-code/) project. You can follow along with our progress in our [public GitHub Project](https://github.com/gatsbyjs/gatsby/projects/20)

### MDX Mini-Conference

The maintainers of MDX are throwing their [first ever conference](https://mdxjs.com/conf/)! It’s free, it will be streamed remotely (because COVID…), and you’ll hear from Gatsby engineers like [Josh Comeau](https://joshwcomeau.com/) and [Laurie Barth](https://laurieontech.com/)

If you want to be the first to hear about new features from Gatsby, and updates from the Gatsby ecosystem, subscribe to our newsletter below!
