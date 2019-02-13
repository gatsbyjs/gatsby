---
title: 2019-02-11-Behind-Scenes-QandA
date: 2019-02-14T08:00:00+00:00
author: Linda Watkins
tags:
- webinar
- q&a
- performance
image: ''
showImageInArticle: false

---
We recently held a [webinar](https://www.gatsbyjs.com/behind-the-scenes/ "Behind the Scenes Webinar") on what makes Gatsby so fast, with performance optimization out of the box. During the live event, we got a lot of questions that we want to share with you here. There’s a mix of topics from how we do image optimization, route-based code splitting, prefetching of routes with intersection observers, and more. Read on to get the answers to all the webinar questions as well as links to learn more.

To watch the full recorded webinar, [register here](https://www.gatsbyjs.com/behind-the-scenes/ "Behind the Scenes Webinar").

**Question:** Are there data fetching hooks that we can use for client-side loading of authenticated content that isn't serialized at build-time?  
**Answer:** Check out [https://www.gatsbyjs.org/docs/building-a-site-with-authentication/](https://www.gatsbyjs.org/docs/building-a-site-with-authentication/ "https://www.gatsbyjs.org/docs/building-a-site-with-authentication/") and [https://www.gatsbyjs.org/docs/building-apps-with-gatsby/](https://www.gatsbyjs.org/docs/building-apps-with-gatsby/ "https://www.gatsbyjs.org/docs/building-apps-with-gatsby/")

**Question:** Can I serialize an api to be stored and accessed client-side only?  
**Answer:** Yup (with a source plugin!). If it's a GraphQL API you can even use [https://www.gatsbyjs.org/packages/gatsby-source-graphql/](https://www.gatsbyjs.org/packages/gatsby-source-graphql/ "https://www.gatsbyjs.org/packages/gatsby-source-graphql/") to invoke that API at *build time*

How about best practices with Styles and Web Fonts?  
Re: styles, I'd recommend using something like CSS Modules (enabled by default!) or a CSS in JS solution if you're into that. We're not opinionated and want to enable everyone to build performant sites, by default!  As far as web fonts, depends! You could use gatsby-plugin-typography and load google fonts if that's your thing. [https://github.com/kyleamathews/typefaces](https://github.com/kyleamathews/typefaces "https://github.com/kyleamathews/typefaces") lets you add open source fonts from NPM packages.

There's a way to use A/B Tests with Gatsby? Any plans to support Unleash Feature Toggle implementation?  
You can do this client-side, there isn't any good out-of-the-box documentation on how to do this right now though. If you do it, write it up!

How does Gatsby work with GraphQL APIs? Create static pages with the content or only when it renders the page?  
With third party graphql APIs — [https://www.gatsbyjs.org/blog/2018-09-25-announcing-graphql-stitching-support/](https://www.gatsbyjs.org/blog/2018-09-25-announcing-graphql-stitching-support/ "https://www.gatsbyjs.org/blog/2018-09-25-announcing-graphql-stitching-support/")

Will Gatsby compile/export static files using the theme from a Ghost installation or will Gatsby compile/export based on another Gatsby theme?  
When you use Gatsby + Ghost you will construct UI in Gatsby rather than Ghost -- [https://www.gatsbyjs.org/blog/2019-01-14-modern-publications-with-gatsby-ghost/](https://www.gatsbyjs.org/blog/2019-01-14-modern-publications-with-gatsby-ghost/ "https://www.gatsbyjs.org/blog/2019-01-14-modern-publications-with-gatsby-ghost/")

I'm  working for a e-Commerce company. We have millions of products in our shop. The product detail site is somewhat the same but for the data. Is there a way to generate all those pages for each of those products in a feasible time?  
Gatsby generally maxes out at 50k pages or so (right now) but you could break up the page, check out [https://www.gatsbyjs.org/blog/2019-01-28-building-a-large-ecommerce-website-with-gatsby-at-daniel-wellington/](https://www.gatsbyjs.org/blog/2019-01-28-building-a-large-ecommerce-website-with-gatsby-at-daniel-wellington/ "https://www.gatsbyjs.org/blog/2019-01-28-building-a-large-ecommerce-website-with-gatsby-at-daniel-wellington/")

I have an app which has Frontend and Admin Panel so how to do code splitting based on Module so admin javascript should not include in Frontend and vice versa  
Gatsby splits code automatically by route so code only used on the admin panel will only be loaded there. Check out this page for details about how to build the admin section [https://www.gatsbyjs.org/docs/building-apps-with-gatsby/](https://www.gatsbyjs.org/docs/building-apps-with-gatsby/ "https://www.gatsbyjs.org/docs/building-apps-with-gatsby/")

How to do SSR loading for Dynamic content for example blog as it uses build time SSR technique  
Gatsby's data layer and source plugins can fetch data dynamically at build time to grab your data. Then whenever your data changes, you rebuild your site with the updated content. Builds are fast so you can update the site every few minutes if necessary.

Will Dynamic content SEO Friendly when we use data layer ?  
Yep! Check out [https://www.gatsbyjs.org/docs/seo/](https://www.gatsbyjs.org/docs/seo/ "https://www.gatsbyjs.org/docs/seo/")

How do you suggest to setup delta builds. Say I have 10 pages and changing only one. Is it possible to build just the one and not all 10?  
This is incremental builds! We're thinking on it and certainly want to deliver this feature--it'd be a great one!

Should I stop using Wordpress altogether? Does Wordpress play well with Gatsby or is Contentful better? Looks like JAMstack is A Wordpress killer.  
It's not a 100% replacement yet — best to start experimenting with things and see how it feels!

How are static assets handled with Gatsby? What is the best approach when using larger amount of SVG icons (think emojis) which may increase the bundle size by more then 100kb's?  
There's a few ways you can handle it. See this docs page which talks about the various options [https://www.gatsbyjs.org/docs/adding-images-fonts-files/](https://www.gatsbyjs.org/docs/adding-images-fonts-files/ "https://www.gatsbyjs.org/docs/adding-images-fonts-files/")

I have a page template that can render different components(50+) according to the page query response. Will those components be then bundled in every page that uses that template?    
Yes — if possible, you can lazy load components as that'll move the code into their own bundle which will only be loaded on demand.

How do content managers preview their changes?  
We have some tooling planned for this :) Stay tuned! [https://www.gatsbyjs.org/blog/2018-07-17-announcing-gatsby-preview/](https://www.gatsbyjs.org/blog/2018-07-17-announcing-gatsby-preview/ "https://www.gatsbyjs.org/blog/2018-07-17-announcing-gatsby-preview/")