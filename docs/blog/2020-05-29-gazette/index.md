---
title: Gatsby Gazette for May 2020 - The Happy Birthday Edition
date: 2020-05-29
author: Hashim Warren
excerpt: "Learn about May's product, community, and ecosystem updates. This includes improvements to Incremental Builds and TypeScript support"
seoTitle: Gatsby Product Updates for May 2020
tags: ["gatsby-gazette", "graphql", "blogs"]
---

This month [Gatsby turned 5-years-old](/blog/2020-05-22-happy-fifth-bday-gatsby/). 🎉

And what a way to mark a birthday - during the same period Gatsby hit the special milestone of having over 2000 plugins. And 500 of them are source plugins ([thanks for noticing Chris Ellis](https://github.com/gatsbyjs/gatsby/pull/23558)). So for whatever your use case, for whatever your data source, there's a Gatsby plugin that can get you up-and-running quickly. And if you need inspiration for your project, GitHub lists [over 200 thousand sites that use Gatsby](https://github.com/gatsbyjs/gatsby/network/dependents?package_id=UGFja2FnZS0xNDM0MDY2Nw%3D%3D) as a dependency!

In May we also announced our [series B round of funding round](/blog/2020-05-27-announcing-series-b-funding/). This investment will help us double down on changing the way the web is built. We've already made Gatsby work better for large and media rich sites. You can keep tabs on Gatsby's progress at [Will It Build](https://willit.build), a new benchmarking site that showcases sub-10-second builds for projects of different sizes and data sources.

## 🚀 New in Gatsby & Gatsby Cloud

### Strapi Instant Preview

Your content editors can now enjoy “instant preview” with Strapi and Gatsby Cloud! If you're new to Strapi, it’s a JavaScript-based, open source CMS. and a great pair for Gatsby projects. The Gatsby starter the Strapi team made for this project is gorgeous 😍 .

![Strapi blog screenshot](/strapi-blog.png)

Give Strapi a try with [this step-by-step tutorial](/blog/2020-05-12-strapi-instant-content-preview-plugin/).

### Faster, and Faster Builds

The nice thing about running your project on Gatsby Cloud is that you can go to sleep, wake up, and your site builds have gotten faster without you having to do anything. We're like a CI/CD tooth fairy.

For example, AgilityCMS is [seeing 5 second builds](https://twitter.com/AgilityCMS/status/1257711270532452354) for their own 500-page website! How can this be? Some say it's [unicorn magic](https://twitter.com/3cordguy/status/1257079916434251780).

Again, you can take a peek at our build time benchmarks at [Will It Build](https://willit.build).

### Faster, and Faster Websites

Fast builds are a great experience for your website's editor, but what about your end-users? The only speed they care about is loading times.

Thanks to a [collaboration with the Chrome team](https://web.dev/granular-chunking-nextjs/), we've made Gatsby sites more performant - again, without you having to make any changes.

How? By bundling a dependency that is used in at least 2 pages, Gatsby can chunk them together so you don't have to download duplicate libraries over and over again.

This won't benefit first-page load, but it improves page navigation as your site needs less Javascript for the next route. Gatsby projects like Ghost’s website saw a 35% reduction in the overall JavaScript they shipped to browsers.

### Faster, and Faster Configuration

When we launched the alpha of Gatsby Recipes in April, it caused a stir in the Web Development community. Immediately many of you understood the potential of Recipes and our vision to make configuring a website as fast and painless as possible.

If you missed the initial launch, Paul Scanlon can bring you up-to-speed with ["Gatsby Recipes - What’s All the Fuss About?"](/blog/2020-05-21-gatsby-recipes/). Also, since the launch there’s been an avalanche of official and community made Recipes, including scripts for configuring:

- React libraries like[React Helmet](https://raw.githubusercontent.com/gatsbyjs/gatsby/master/packages/gatsby-recipes/recipes/gatsby-plugin-react-helmet.mdx) and [Preact](https://raw.githubusercontent.com/gatsbyjs/gatsby/master/packages/gatsby-recipes/recipes/preact.mdx)

- Themes and Starters, like [gatsby-theme-blog](https://raw.githubusercontent.com/gatsbyjs/gatsby/master/packages/gatsby-recipes/recipes/gatsby-theme-blog.mdx) and [gatsby-theme-notes-starter](https://raw.githubusercontent.com/gatsbyjs/gatsby/master/packages/gatsby-recipes/recipes/gatsby-theme-notes.mdx)

- Advanced configs, like [headless WordPress](https://raw.githubusercontent.com/gatsbyjs/gatsby/master/packages/gatsby-recipes/recipes/wordpress.mdx) and [Progressive WebApps](https://raw.githubusercontent.com/gatsbyjs/gatsby/master/packages/gatsby-recipes/recipes/pwa.mdx)

Learn how to develop your own Gatsby Recipes [here](https://github.com/gatsbyjs/gatsby/tree/master/packages/gatsby-recipes). And if you’re looking for ideas, I could really use a Recipe that spins up placeholder sites for all of the unused domains I purchased last year. And for all of the domains I’m going to purchase - and not use - this year.

### TypeScript Support

Gatsby loves the TypeScript community. When you pass one of them, you know exactly what type of person you’re dealing with.

This month we made the Gatsby Typescript plugin part of core Gatsby, so you no longer need to install it to enable TypeScript support in your project. Read our [updated TypeScrip docs](/docs/typescript/) and the Pull Request that enacted this change(https://github.com/gatsbyjs/gatsby/pull/23547). Also [join the Twitter conversation](https://twitter.com/gatsbyjs/status/1258427651066400768).

### GraphQL Tracing

In may we continued to improve our error messaging (see example [here](https://github.com/gatsbyjs/gatsby/pull/24186) and [here](https://github.com/gatsbyjs/gatsby/pull/23741)). But what about slow GraphQL queries? Well, Gatsby now supports performance tracing using the opentracing standard. You can to [enable tracing for GraphQL queries](/docs/performance-tracing/). This is useful because it allows you to debug why querying may be slow in your Gatsby project.

## 👩‍🚀 New in the Gatsby Community

### Gatsby Days is June 2 - 3

[Register to attend](https://www.gatsbyjs.com/resources/gatsby-days/) our first ever virtual Gatsby Days!

We have a superb [lineup of speakers](/blog/2020-05-13-virtual-gatsby-day-speakers/) from the Gatsby community. And you’ll hear from Gatsby co-founder Kyle Mathews about what’s coming next.

Speaking of Kyle…

### Changelog Podcast: Gatsby's Road to Incremental Builds

Jerod Santo interviewed Kyle for [the Changelog podcast](https://changelog.com/podcast/393). Kyle took a deep dive on how Gatsby decides which features should be in open source, and which features can be enabled by [Gatsby Cloud](https://gatsbyjs.com).

### Gatsby Web Creators

Over on YouTube and Twitch, Gatsby engineers Aisha Blake and Marcy Sutton continued the Web Creator series with episodes on [JavaScript fundamentals](https://www.youtube.com/watch?v=3jrzv7l9vsI) and [building an interactive UI](https://www.youtube.com/watch?v=jiilkXCDNPs).

If you know someone who is new to Web Development, point them to Gatsby Web Creators for a fun introduction to the basics!

### Building an Accessible Gatsby Site

https://www.youtube.com/watch?v=qmcclQ7UPLk

For current web professionals, Marcy livestreamed a session on making websites that everyone can access and use. In her tutorial, you'll learn the fundamentals of building a Gatsby site with web accessibility in mind, from the basics to more advanced techniques and requirements. You’ll get a tour of how to build and test inclusively with HTML, CSS, and JavaScript as applied in a Gatsby site.

### Gatsby Community Kudos

Thank you **Sethu Sathyan** for rapidly building [Startups vs Covid](https://www.startupsvscovid.com/) and for teaching others with your article, [“How to build a website using Gatsby & Airtable in 30 mins”](https://dev.to/sethu/how-to-build-a-website-using-gatsby-airtable-in-30-mins-42gm).

Thank you **Andres Alvarez** for choosing Gatsby for [your first open source PR](https://github.com/gatsbyjs/gatsby/pull/23537)! Your table of contents for the API reference pages will benefit thousands of readers. And thank you **Adam Millerchip** for making your first Gatsby PR and [fixing a common hiccup](https://github.com/gatsbyjs/gatsby/pull/23775) developers were having with our documentation.

Thank you **Brian Han** for noticing and using [our built-in a11y linting](https://twitter.com/_brianhan/status/1262416611316727813). Your shout out is appreciated by the Gatsby team, and increases awareness for a11y in Web Development.

Thank you **Akuoko Daniel Jnr** for helpful your article, ["Increasing Website Performance With Gatsby Plugins"](https://bejamas.io/blog/gatsby-plugins/). The recommendations in your article would make a great Gatsby Recipe! 😉

And special thanks to our long time community member, **Horacio Herrera** for making a site to [teach Gatsby to Web Developers in Spanish](https://aprendegatsby.com/). We appreciate you!

## 🪐 New in the Gatsby Ecosystem

### Gatsby Themes & Plugins

Many exciting Gatsby Themes and Plugins premiered in May. There was [Gatsby Theme Catalyst](https://www.gatsbyjs.org/blog/2020-05-14-introducing-gatsby-theme-catalyst/), Eric Howey exciting exploration in theme architecture. Aravind Balla [launched gatsby-theme-andy](https://twitter.com/aravindballa/status/1260878161920716804), an ambitious theme for power note-taking. And Trevor Harmon [dropped gatsby-theme-shopify-manager](https://thetrevorharmon.com/blog/introducing-gatsby-theme-shopify-manager), a living demonstration of the talk he delivered at Gatsby Days LA, [“Sell Things Fast With Gatsby and Shopify”](https://www.youtube.com/watch?v=tUtuGAFOjYI).

All of the Gatsby Themes above are worth using and studying to accelerate your own work!

### Azure Static Web Apps

Microsoft debuted [Azure Static Web Apps](https://azure.microsoft.com/en-us/services/app-service/static/) at the Build Conference, and we're excited to see provide first-class support for Gatsby projects. Follow along our new doc so you can [deploy your Gatsby site to Azure](https://www.gatsbyjs.org/docs/deploying-to-azure/).

### GraphQL for WordPress is growing!

WPGraphQL, a [WordPress plugin Gatsby proudly supports](/docs/glossary/wpgraphql/), recently [passed 40,000 downloads](https://packagist.org/packages/wp-graphql/wp-graphql/stats), and the Slack community now tops 1,000. We love the enterprise use cases we're seeing from developers who've adopted WPGraphQL for their projects!

### MDX v2 is coming

Another open source project Gatsby supports, MDX has announced the changes you can look forward to in version 2. You can follow the progress of v2 with [this umbrella issue at the MDX repo](https://github.com/mdx-js/mdx/issues/1041).

### New Gatsby Starter and Podcast from Contentful

Our friends at Contentful developed an [official Gatsby starter](https://github.com/contentful/starter-gatsby-blog) that you can use for blogging. The team over there also produce a new podcast on Web Development, and they recently had [an episode about Gatsby](https://anchor.fm/contentful-creators/episodes/E4--A-Conversation-about-Gatsby-and-Static-Site-Generators--Nikan-Shahidi-ed9mnc).

## 🙂 What a month!

May was an incredible month for Gatsby, our community, and the entire ecosystem! But June will be even more exciting! [Register for Gatsby Days](https://www.gatsbyjs.com/resources/gatsby-days/) and you'll hear about all of the new products and features we have coming this year.
