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

How do you keep on top of things like price changes and stock availability with a static generated site?  
We actually do this on the GatsbyJS store. Check out the code, and hope it's helpful! https://github.com/gatsbyjs/store.gatsbyjs.org

Is there a good upgrade path for new versions of Gatsby?   
Unless you're on v1, you won't need a migration. If you are on v1 and want to move to v2: https://www.gatsbyjs.org/docs/migrating-from-v1-to-v2/.

Following up on upgrade path question—how would you upgrade between version of 2.\~?   
You can bump the version # in your package.json and then you're done

The question asked about search—how would you implement a site search in Gatsby?   
One of the best things about Gatsby is that it's pretty agnostic on tech stack(s). So.. you're free to use what you want. I've used Algolia in the past and loved it, but you're free to implement this however you'd like! https://www.gatsbyjs.org/docs/adding-search/

What is a 'route'?  
Basically a URL, eg /blog/\[post-name\]

Should i know React before starting to learn Gatsby?  
You don't need to! Gatsby is a great playground for learning React. Check out this post: https://www.gatsbyjs.org/blog/2018-12-19-gatsby-scales-with-expertise-and-scope/

If my .htaccess file is configured to read  .html files without the extension in the url, can gatsby compile the links to pages without the .html ending?  
We haven't added support for this

Follow up to the .htaccess question, how do you manage to hide .html from your url on gatsby.com?  
Many servers can do this. Generally the feature is called "clean urls"

Is there a good starting point to compare building sites with Gatsby that developers would have built on platforms like WordPress or Craft, etc previously?  
There are blog posts people have written about their experience on our blog at https://www.gatsbyjs.org/blog/tags/wordpress

Regarding Environment Variables and security. How do we keep secure endpoints using env vars like process.env to handle authorization keys and secrets? Does this mean Node would be required in prod environment?  
Yes, process.env is recommended for secret management. https://www.gatsbyjs.org/docs/environment-variables/, Generally you'd add these to gatsby-config.js — so would be used for the build but wouldn't be sent to users. So the keys wouldn't leak.

What are best practices for making a gatsby site dynamic by posting/fetching to/from a DB, like MongoDB, MySql, etc..  
You can use a DB as your backend -- https://www.gatsbyjs.org/docs/sourcing-from-databases/. Posting to a database can be doing with AJAX requests.

As a follow up to DB question, the tutorials give an example of building pages from markdown files. Would that same approach be possible from DB queries?  
Yep!

If a company had numerous content managers (let's say 30), and they all needed to be able to create and publish content to a blog (which could be multiple on the same site) or a page, each update would require a new build? Is that an accurate understanding?  
We're building a service for Preview that'll instantly update a staging version of the site and that can handle as many content updaters as you throw at it [https://www.gatsbyjs.org/blog/2018-07-17-announcing-gatsby-preview/#reach-skip-nav](https://www.gatsbyjs.org/blog/2018-07-17-announcing-gatsby-preview/#reach-skip-nav "https://www.gatsbyjs.org/blog/2018-07-17-announcing-gatsby-preview/#reach-skip-nav")

The Preview feature is awesome. But I'm thinking like a 24 hours news channel, which our company has, and a manager needing to post content at 2 am, or even more, stories being posted multiple times an hour at all hours. Will each update require a new build?  
Yes. Builds are fast and automatic though so doesn't take any extra work or mental overhead.

How can I expose global variables during the build process? We are looking to use JSDom during the build process. We currently have the async loading of the Interweave module, but we want our ssr generated html to match the final rendered DOM.  
Check out this docs page [https://www.gatsbyjs.org/docs/environment-variables/#environment-variables](https://www.gatsbyjs.org/docs/environment-variables/#environment-variables "https://www.gatsbyjs.org/docs/environment-variables/#environment-variables")

is there any \`lighthouse.test.js\` out there, to use while building/customizing gatsby to keep an eye on performance? (similar to the one that was shown at the very beginning of the presentation).   
You can just re-use mine--or could be worth building some tooling! We'll be sure to link to those resources soon!

Any advice for running automated performance tests for sites that are hidden behind a login page?  
A CI can do a build and then run the lighthouse test on the built site

What are your thoughts on sanity.io  
Seems great :) Check out this blog post for more info -> [https://www.gatsbyjs.org/blog/2019-01-25-blazing-fast-development-with-gatsby-and-sanity-io/](https://www.gatsbyjs.org/blog/2019-01-25-blazing-fast-development-with-gatsby-and-sanity-io/ "https://www.gatsbyjs.org/blog/2019-01-25-blazing-fast-development-with-gatsby-and-sanity-io/")

What is your opinion on using CSS, ie Styled Components, Emotion or BEM?  
Dustin) We don't really have an official opinion--we want you to build apps however you prefer! That being said, I quite like CSS in JS (particularly emotion). I did a little podcast with Chris Coyier if you're interested--[https://css-tricks.com/video-screencasts/168-css-in-js/](https://css-tricks.com/video-screencasts/168-css-in-js/ "https://css-tricks.com/video-screencasts/168-css-in-js/")

no concern of the additional request for the SVG??  
SVGs previews are inlined

no concerns of excessive prefetching in the bg?   
This is turned off on low-power devices as per the Dan Abramov comment

Re content updates: But is a new build triggered on *every* co_tent nge?  
_ou can configure it that way -- send webhooks to have your CI server rebuild

Can you talk more about Themes & how to create custom themes for V2?

Look at [https://www.gatsbyjs.org/blog/2018-11-11-introducing-gatsby-themes/](https://www.gatsbyjs.org/blog/2018-11-11-introducing-gatsby-themes/ "https://www.gatsbyjs.org/blog/2018-11-11-introducing-gatsby-themes/") and [https://www.gatsbyjs.com/gatsby-days-themes-chris/](https://www.gatsbyjs.com/gatsby-days-themes-chris/ "https://www.gatsbyjs.com/gatsby-days-themes-chris/") and stay tuned for more posts in next week!