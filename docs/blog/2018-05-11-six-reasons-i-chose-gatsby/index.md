---
title: Six Reasons I Chose Gatsby
date: 2018-05-11
author: Ray Gesualdo
excerpt: "Spoiler alert: I'm a big fan of Gatsby."
tags: ["react", "graphql", "plugins", "developer-experience"]
canonicalLink: https://www.raygesualdo.com/posts/six-reasons-i-chose-gatsby/
publishedAt: raygesualdo.com
---

Spoiler alert: I'm a big fan of [Gatsby](/). I've worked with it multiple times and I'm continually impressed with its power and flexibility. For those who aren't familiar, Gatsby is an open-source static site generator incorporating React and GraphQL. A few weeks ago, I switched my site to Gatsby and wanted to share my reasons for doing so. Plenty of articles have been written about _how_ to build a Gatsby site, but I wanted to talk about _why_ Gatsby is a great choice. I've outlined these reasons below in no particular order (the numbering is only for organizational purposes). I hope they give you a better understanding of Gatsby's benefits and features.

## #1: It's React

I've been working with React for the better part of 3.5 years. I know it. I'm efficient in it. Being able to create my site markup with React makes complete sense for me. More than that however, by using React as its templating engine, Gatsby also benefits from all the wonderful React components developed by the community. Like CSS-in-JS? Use it ([styled-components](https://styled-components.com) FTW!). Have a favorite React UI kit? Throw it in there. Any React component that can be server-side rendered, which is most of them, can be used with Gatsby. This opens up a whole new set of possibilities when building out your "static" site.

## #2: An extensive, well-architected plugin system

One of the first things about Gatsby that impressed me was its plugin system. Like many other OSS tools such as Webpack and Babel, much of the power of Gatsby is provided by plugins. And that's a good thing. Its plugin architecture allows for incredibly deep integrations into almost every aspect of Gatsby: build configuration, data extraction and transformation, the build process, the browser at runtime, etc. This system has allowed not only the core Gatsby team to create powerful plugins, but the community to create equally powerful plugins as well. I've even tried my hand at [writing one](https://github.com/raygesualdo/gatsby-plugin-settings) (quite successfully, I might add). If there's a task you're looking to accomplish with Gatsby, odds are there is already a plugin for it. And if not, there's [plenty of documentation](/docs/plugins/) to help you get started writing one.

## #3: The data fetching layer

With any website, one needs to have data/content injected into markup to generate HTML. With static site generators, this usually involves writing Markdown files adjacent to template files that get merged together in some way at build time. Gatsby takes a different approach by providing a data fetching abstraction layer between your data/content and your templates. This brings about a huge paradigm shift both in how data is accessed in the templates as well as from where data can be pulled (we'll look at the latter in reason #4).

With Gatsby, the entirety of your site's data is accessed via a local [GraphQL](https://graphql.org/) API. If you've never worked with GraphQL before, that's okay; Gatsby's docs [walk you through the process](/docs/graphql-concepts/). In your page templates, you can specify the data you require for that page as a GraphQL query. Then, when Gatsby's build process runs, it analyzes the query and provides the requested data to the template. Future versions of Gatsby will also let you do this at the component level as well. This allows you to build up your templates using the React's normal component paradigm.

## #4: Multiple data sources

Because the manner in which one accesses data is abstracted from the data itself, Gatsby can collate data from multiple sources which can then be queried by our templates. This is a significant difference when compared to most static site generators. Instead of only using Markdown files, I can now use any number of different data files locally. But I can also pull data from remote sources such as WordPress, Drupal, Contentful, Stripe, Trello, Medium, MongoDB, and many others. If the data you require can be accessed via an API, you can write a Gatsby source plugin to consume it too. Moreover, any number of these sources can be used in parallel. This allows for powerful and flexible combinations to bring just about any data into your site. I'll be writing a whole blog post on this soon.

## #5: Performance and PWA features out-of-the-box

Performance on the web can be difficult. It's especially helpful to have a tool that enforces best practices and optimizes your site by default. Gatsby does just that. When the build process runs, Gatsby creates static HTML files for each of your pages which provides fast initial load times and makes SEO much simpler. Once your page is loaded by the browser though, Gatsby will boot up React and navigate around your site as if you were navigating via a single page app with near-instant transitions without page reloads. Gatsby will even prefetch adjacent/related page content in the background so there's zero delay when your user clicks a link. The client-side experience is buttery smooth with JavaScript enabled and you don't lose any content or navigation if the user has JavaScript disabled. By adding a single plugin, Gatsby can provide offline support as well, transforming your site into a full-blown Progressive Web App.

## #6: The developer experience

This one may be a bit more subjective, but working with Gatsby is plain fun. The plugin system makes it easy to extend, typically with a simple `npm install` and a few lines in the configuration file. When you're developing or writing local content, Gatsby has live-reload so you see your changes immediately. Documentation for the project is solid and keeps improving. The maintainers are extremely helpful on GitHub and Twitter (and I'm sure elsewhere too). It's an all around pleasant experience.

---

Have you used Gatsby before? What are your reasons for using it? Chat with me about them on [Twitter](https://twitter.com/RayGesualdo)!
