---
title: Gatsby And The JAMstack - A Bright Future For The Web
date: "2018-02-16"
image: "bright-future.jpg"
author: "Ryan Wiemer"
---

_This article was originally published on
[Medium](https://medium.com/@ryanwiemer/gatsby-and-the-jam-stack-91e31508f364)
on January 31, 2018._

Recently I relaunched my wife’s photography portfolio, [KNW Photography](https://www.knw.io/), using a combination of Gatsby, [Contentful](https://www.contentful.com/) and [Netlify](https://www.netlify.com/). This particular group of tools represents a new and exciting web development architecture known as the [JAMstack](https://jamstack.org/) (Javascript, APIs and Markup). In this post I will be sharing my personal thoughts on each of these new tools and why together they represent the “holy grail” of the static website world.

## Why Other Static Site Generators Didn’t Work For Me

In case you hadn’t noticed the web moves at an insane speed. With new frameworks and tools being introduced almost daily it can be intimidating even for the most experienced developers. Perhaps you have jumped on the bandwagon too early only to regret it later. Or maybe you have given up on new tools and are happy to settle with outdated …err I mean... trusted solutions. 😉 Admittedly it’s a balancing act but I believe that in order to stay relevant we need to evolve with the web while ensuring that selected tools are robust enough to last.

It was for those reasons that I was hesitant to pull the trigger on a static site generator. I feared that picking the wrong one would result in wasted time either immediately or later down the road. While static site generators have existed in some form for a while, see [Hugo](https://gohugo.io/), [Jekyll](https://jekyllrb.com/) and [Middleman](https://middlemanapp.com/), they have mostly been used by developers or code-savvy bloggers. Although these tools offer benefits such as greater speed, better security and simpler code what most of them lack in my opinion is a good solution for non technical users to update website content. Asking a non developer to edit a markdown file and commit it to GitHub is simply not realistic for most clients. Some businesses were even started to fill this niche such as [Siteleaf](https://www.siteleaf.com/) and [Forestry](https://forestry.io/) which provide a CMS for static sites built with Jekyll. Although those solutions solve part of the problem they felt too limiting for my taste and creating anything other than a simple blog is like fitting a square peg into a round hole.

## Gatsby And The Road To Success

![Road To Success](road-to-success.jpg)

One day after airing my grievances about the current state of static site generators on Slack a fellow developer recommend that I check out Gatsby. Gatsby is yet another static site generator but what really set it apart for me was how it was built with [React](https://reactjs.org/) and emphasized a rich plugin system. This was a big plus for me as I was itching to learn more about React and the plugin system alleviated some initial pain that I would have had dealing with mundane tasks. Out of the box you get a fantastic development environment with live reloading that required almost no configuration. With Gatsby specific plugins and React components it can handle pretty much anything you throw at it.

Next came integrating the statically generated site with data stored in a CMS. Again Gatsby was well suited for this and I was able to easily integrate with Contentful via the [gatsby-source-contentful](https://www.gatsbyjs.org/packages/gatsby-source-contentful/) plugin. Contentful is an example of a headless CMS, meaning that is is not tied to any particular technology or language. Contentful allows you to store content using a pleasant user interface and it can then output the data via an API. Best of all Contentful puts you in the driver seat and lets you define your own content model however you see fit. Think [WordPress Advanced Custom Fields](https://www.advancedcustomfields.com/) on steroids. With the content stored in Contentful Gatsby then uses the Contenful API along with the awesome power of [GraphQL](http://graphql.org/) to query data at build time. Cool stuff!

The final piece of the puzzle was determining where to host the website. I had recently experimented with Netlify on a somewhat [pointless website for my dog](https://www.doggoforhire.com/) and I was impressed by its ease of use and how they offered a fully featured developer tier for free. In no time I was able to get my Gatsby powered website up and running on Netlify. Then with the help of webhooks I was able to have Contentful tell Netlify to “rebuild” the website whenever a new post was published. Finally with Netlify’s form handling functionality I hooked up a contact form all without a single line of backend code or even a database.

## The Final Product

![Final Product](final-product.jpg)

After a little over a month of tinkering on the design during nights and weekends I had a fully functional website ready to be launched. During this process I learned a fair bit of how to code with React and the Gatsby community seemed genuinely nice and happy to help me to learn. The final product was a website that felt like it belonged in 2018 while still allowing my wife to easily update content with no assistance. Not only that the website was immensely faster than the previous WordPress version, served over HTTPS, utilized a CDN and cost me $0 dollars a month thanks to the extremely generous free tiers offered by Netlify and Contentful. 😍

If you are currently on the fence about static site generators or the JAMstack in general there has never been a better time to jump in. In my humble opinion with these tools it has finally reached the level of maturity to not just be feasible for client work but actually pretty darn amazing.

For those interested the source code for the website I built is available on GitHub: https://github.com/ryanwiemer/knw
