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
We recently held a [webinar](https://www.gatsbyjs.com/behind-the-scenes/ "Behind the Scenes Webinar") on what makes Gatsby so fast, with performance optimization out of the box. During the live event, we got over 100 questions that we want to share with you here. There’s a mix of topics from how we do image optimization, route-based code splitting, prefetching of routes with intersection observers, and more. Read on to get the answers to all the webinar questions as well as links to learn more.

To watch the full recorded webinar, [register here](https://www.gatsbyjs.com/behind-the-scenes/ "Behind the Scenes Webinar").

**Question:** Are there data fetching hooks that we can use for client-side loading of authenticated content that isn't serialized at build-time?  
**Answer:** Check out [https://www.gatsbyjs.org/docs/building-a-site-with-authentication/](https://www.gatsbyjs.org/docs/building-a-site-with-authentication/ "https://www.gatsbyjs.org/docs/building-a-site-with-authentication/") and [https://www.gatsbyjs.org/docs/building-apps-with-gatsby/](https://www.gatsbyjs.org/docs/building-apps-with-gatsby/ "https://www.gatsbyjs.org/docs/building-apps-with-gatsby/")

**Question:** Can I serialize an api to be stored and accessed client-side only?  
**Answer:** Yup (with a source plugin!). If it's a GraphQL API you can even use [https://www.gatsbyjs.org/packages/gatsby-source-graphql/](https://www.gatsbyjs.org/packages/gatsby-source-graphql/ "https://www.gatsbyjs.org/packages/gatsby-source-graphql/") to invoke that API at _build time_

How about best practices with Styles and Web Fonts?  
Re: Styles, I'd recommend using something like CSS Modules (enabled by default!) or a CSS in JS solution if you're into that. We're not opinionated and want to enable everyone to build performant sites, by default!  As far as web fonts, depends! You could use gatsby-plugin-typography and load google fonts if that's your thing. [https://github.com/kyleamathews/typefaces](https://github.com/kyleamathews/typefaces "https://github.com/kyleamathews/typefaces") lets you add open source fonts from NPM packages.

There's a way to use A/B Tests with Gatsby? Any plans to support Unleash Feature Toggle implementation?  
You can do this client-side, there isn't any good out-of-the-box documentation on how to do this right now though. If you do it, write it up!

How does Gatsby work with GraphQL APIs? Create static pages with the content or only when it renders the page?  
With third party graphql APIs — [https://www.gatsbyjs.org/blog/2018-09-25-announcing-graphql-stitching-support/](https://www.gatsbyjs.org/blog/2018-09-25-announcing-graphql-stitching-support/ "https://www.gatsbyjs.org/blog/2018-09-25-announcing-graphql-stitching-support/")

Will Gatsby compile/export static files using the theme from a Ghost installation or will Gatsby compile/export based on another Gatsby theme?  
When you use Gatsby + Ghost you will construct UI in Gatsby rather than Ghost -- [https://www.gatsbyjs.org/blog/2019-01-14-modern-publications-with-gatsby-ghost/](https://www.gatsbyjs.org/blog/2019-01-14-modern-publications-with-gatsby-ghost/ "https://www.gatsbyjs.org/blog/2019-01-14-modern-publications-with-gatsby-ghost/")

I'm  working for a e-Commerce company. We have millions of products in our shop. The product detail site is somewhat the same but for the data. Is there a way to generate all those pages for each of those products in a feasible time?  
Gatsby generally maxes out at 50k pages or so (right now) but you could break up the page, check out [https://www.gatsbyjs.org/blog/2019-01-28-building-a-large-ecommerce-website-with-gatsby-at-daniel-wellington/](https://www.gatsbyjs.org/blog/2019-01-28-building-a-large-ecommerce-website-with-gatsby-at-daniel-wellington/ "https://www.gatsbyjs.org/blog/2019-01-28-building-a-large-ecommerce-website-with-gatsby-at-daniel-wellington/")

I have an app which has Frontend and Admin Panel so how do I do code splitting based on Module so the admin javascript should not include in Frontend and vice versa?  
Gatsby splits code automatically by route so code only used on the admin panel will only be loaded there. Check out this page for details about how to build the admin section [https://www.gatsbyjs.org/docs/building-apps-with-gatsby/](https://www.gatsbyjs.org/docs/building-apps-with-gatsby/ "https://www.gatsbyjs.org/docs/building-apps-with-gatsby/")

How to do SSR loading for Dynamic content- for example, a blog, as it uses build time SSR technique?  
Gatsby's data layer and source plugins can fetch data dynamically at build time to grab your data. Then whenever your data changes, you rebuild your site with the updated content. Builds are fast so you can update the site every few minutes if necessary.

Is Dynamic content SEO Friendly when we use data layer ?  
Yep! Check out [https://www.gatsbyjs.org/docs/seo/](https://www.gatsbyjs.org/docs/seo/ "https://www.gatsbyjs.org/docs/seo/")

How do you suggest to setup delta builds? Say I have 10 pages and am changing only one. Is it possible to build just the one and not all 10?  
This is incremental builds! We're thinking on it and certainly want to deliver this feature--it'd be a great one!

Should I stop using Wordpress altogether? Does Wordpress play well with Gatsby or is Contentful better? Looks like JAMstack is a Wordpress killer.  
It's not a 100% replacement yet — best to start experimenting with things and see how it feels!

How are static assets handled with Gatsby? What is the best approach when using larger amount of SVG icons (think emojis) which may increase the bundle size by more than 100kb's?  
There's a few ways you can handle it. See this docs page which talks about the various options [https://www.gatsbyjs.org/docs/adding-images-fonts-files/](https://www.gatsbyjs.org/docs/adding-images-fonts-files/ "https://www.gatsbyjs.org/docs/adding-images-fonts-files/")

I have a page template that can render different components(50+) according to the page query response. Will those components be then bundled in every page that uses that template?  
Yes — if possible, you can lazy load components as that'll move the code into their own bundle which will only be loaded on demand.

How do content managers preview their changes?  
We have some tooling planned for this :) Stay tuned! [https://www.gatsbyjs.org/blog/2018-07-17-announcing-gatsby-preview/](https://www.gatsbyjs.org/blog/2018-07-17-announcing-gatsby-preview/ "https://www.gatsbyjs.org/blog/2018-07-17-announcing-gatsby-preview/")

How do you keep on top of things like price changes and stock availability with a static generated site?  
We actually do this on the GatsbyJS store. Check out the code, and hope it's helpful: https://github.com/gatsbyjs/store.gatsbyjs.org

Is there a good upgrade path for new versions of Gatsby?  
Unless you're on v1, you won't need a migration. If you are on v1 and want to move to v2: https://www.gatsbyjs.org/docs/migrating-from-v1-to-v2/.

Following up on upgrade path question—how would you upgrade between version of 2.\~?  
You can bump the version # in your package.json and then you're done.

The question asked about search—how would you implement a site search in Gatsby?  
One of the best things about Gatsby is that it's pretty agnostic on tech stack(s). So you're free to use what you want. I've used Algolia in the past and loved it, but you're free to implement this however you'd like! https://www.gatsbyjs.org/docs/adding-search/

What is a 'route'?  
Basically a URL, eg /blog/\[post-name\]

Should i know React before starting to learn Gatsby?  
You don't need to! Gatsby is a great playground for learning React. Check out this post: https://www.gatsbyjs.org/blog/2018-12-19-gatsby-scales-with-expertise-and-scope/

If my .htaccess file is configured to read  .html files without the extension in the url, can Gatsby compile the links to pages without the .html ending?  
We haven't added support for this yet.

Follow up to the .htaccess question, how do you manage to hide .html from your url on gatsbyjs.com?  
Many servers can do this. Generally the feature is called "clean urls".

Is there a good starting point to compare building sites with Gatsby that developers would have built on platforms like WordPress or Craft, etc previously?  
There are blog posts people have written about their experience on our blog at https://www.gatsbyjs.org/blog/tags/wordpress

Regarding Environment Variables and security- how do we keep secure endpoints using env vars like process.env to handle authorization keys and secrets? Does this mean Node would be required in prod environment?  
Yes, process.env is recommended for secret management. https://www.gatsbyjs.org/docs/environment-variables/, Generally you'd add these to gatsby-config.js — so would be used for the build but wouldn't be sent to users, so the keys wouldn't leak.

What are best practices for making a Gatsby site dynamic by posting/fetching to/from a DB, like MongoDB, MySql, etc..  
You can use a DB as your backend -- https://www.gatsbyjs.org/docs/sourcing-from-databases/. Posting to a database can be done with AJAX requests.

As a follow up to DB question, the tutorials give an example of building pages from markdown files. Would that same approach be possible from DB queries?  
Yep!

If a company had numerous content managers (let's say 30), and they all needed to be able to create and publish content to a blog (which could be multiple on the same site) or a page, each update would require a new build? Is that an accurate understanding?  
We're building a service for Preview that'll instantly update a staging version of the site and that can handle as many content updaters as you throw at it [https://www.gatsbyjs.org/blog/2018-07-17-announcing-gatsby-preview/#reach-skip-nav](https://www.gatsbyjs.org/blog/2018-07-17-announcing-gatsby-preview/#reach-skip-nav "https://www.gatsbyjs.org/blog/2018-07-17-announcing-gatsby-preview/#reach-skip-nav")

The Preview feature is awesome. But I'm thinking like a 24 hours news channel, which our company has, and a manager needing to post content at 2 am, or even more, stories being posted multiple times an hour at all hours. Will each update require a new build?  
Yes. Builds are fast and automatic though so doesn't take any extra work or mental overhead.

How can I expose global variables during the build process? We are looking to use JSDom during the build process. We currently have the async loading of the Interweave module, but we want our ssr generated html to match the final rendered DOM.  
Check out this docs page [https://www.gatsbyjs.org/docs/environment-variables/#environment-variables](https://www.gatsbyjs.org/docs/environment-variables/#environment-variables "https://www.gatsbyjs.org/docs/environment-variables/#environment-variables")

Any advice for running automated performance tests for sites that are hidden behind a login page?  
A CI can do a build and then run the lighthouse test on the built site.

What are your thoughts on sanity.io?  
Seems great :) Check out this blog post for more info -> [https://www.gatsbyjs.org/blog/2019-01-25-blazing-fast-development-with-gatsby-and-sanity-io/](https://www.gatsbyjs.org/blog/2019-01-25-blazing-fast-development-with-gatsby-and-sanity-io/ "https://www.gatsbyjs.org/blog/2019-01-25-blazing-fast-development-with-gatsby-and-sanity-io/")

What is your opinion on using CSS, ie Styled Components, Emotion or BEM?  
We don't really have an official opinion--we want you to build apps however you prefer! That being said, I quite like CSS in JS (particularly emotion). I did a little podcast with Chris Coyier if you're interested--[https://css-tricks.com/video-screencasts/168-css-in-js/](https://css-tricks.com/video-screencasts/168-css-in-js/ "https://css-tricks.com/video-screencasts/168-css-in-js/")

No concern of the additional request for the SVG??  
SVGs previews are inlined.

No concerns of excessive prefetching in the bg?  
This is turned off on low-power devices.

Re content updates: But is a new build triggered on _every_ content change?  
You can configure it that way -- send webhooks to have your CI server rebuild.

Can you talk more about Themes & how to create custom themes for V2?  
Look at [https://www.gatsbyjs.org/blog/2018-11-11-introducing-gatsby-themes/](https://www.gatsbyjs.org/blog/2018-11-11-introducing-gatsby-themes/ "https://www.gatsbyjs.org/blog/2018-11-11-introducing-gatsby-themes/") and [https://www.gatsbyjs.com/gatsby-days-themes-chris/](https://www.gatsbyjs.com/gatsby-days-themes-chris/ "https://www.gatsbyjs.com/gatsby-days-themes-chris/") and stay tuned for more posts in next week!

What's the best way to get involved with contributing to Gatsby? Do you have regular calls for contributors or a preferred async channel e.g. Slack / Discord?  
We do have Discord, and highly recommend it! Check out our Community page -> https://www.gatsbyjs.org/docs/community/

How did you implement the Github PR test for lighthouse scoring?  
All available in this repo. I run Lighthouse from a CI container, and then parse the response: https://github.com/dschau/gatsby-perf-audit

Who does the Gatsby team consider its users? Content creators? Engineers? Other?  
All of the above!

What is the main difference between Gatsby and react-static?  
React-static is a subset of Gatsby — it lets you programmatically create pages like Gatsby and has a limited plugin system but doesn't have a data layer for connecting to 3rd party APIs or transforming markdown and images.

How does Gatsby handle builds of a thousand pages? Let's say I've already run Gatsby build before to build it and then only one page has been changed, does Gatsby knows how to build only the pages that were changed?  
We don't yet have incremental builds, but 1000 page sites should build relatively quickly (a couple of minutes). Stay tuned on incremental builds!

Is there a way to enable SSR on run time to things like a post preview?  
If you mean a screenshot of the built site, you could deploy to a staged URL, and then use a plugin like https://github.com/gatsbyjs/gatsby/tree/master/packages/gatsby-transformer-screenshot and then query for your page preview (we do this on gatsbyjs.org!). Additionally, something like using a screenshot service (https://screenshot-v2.now.sh/blog.dustinschau.com?type=png) would work, as well. We're working on a service for this: https://www.gatsbyjs.org/blog/2018-07-17-announcing-gatsby-preview/

You mentioned 'Incremental builds' on another question, can you point me to where I can read more about the ideas and status?  
Some prior art here: https://github.com/gatsbyjs/gatsby/issues/5002 and https://github.com/gatsbyjs/gatsby/issues/9083 Once we're ready to start implementing, we'll most likely create an RFC and solicit community feedback for the functionality. We haven't talked too much about it publicly, but you can read a general overview in our company launch post which talks about our long-term vision https://www.gatsbyjs.org/blog/2018-05-24-launching-new-gatsby-company/#distributed-computing--event-sourcing

Does the lazy-loading technique apply to images hosted on a cloud based management service such as Cloudinary?  
There would need to be support added for Cloudinary. There's been talk about this but nobody has built it yet. Some CMSs like Contentful, Datocms, and sanity.io have added support gatsby-image.

On mobile, where a user is not able to hover, how does this prefetching method differ?  
Prefetching starts when a link appears on the screen so it works on mobile very well.

Would it makes sense to still use Gatsby for a more "dynamic" type of app?  
Yes! You can learn more about what types of dynamic apps you can build with Gatsby here: https://www.gatsbyjs.com/build-web-apps-webinar

Can I use Gatsby Image with images from external sources like Cloudinary or an AWS bucket? And if it's indeed possible, will this impact my build time if I have thousands of images?  
Yes, build-times do go up with image processing as it's very CPU intensive.

Is there a 3rd party CMS that you recommend that works particular well with Gatsby?  
Lots of CMS-s! Here's a list: https://www.gatsbyjs.org/docs/headless-cms/

What CI system did you use for the (Harry’s shopflamingo.com) website?  
CircleCI. it's incredible, definitely check it out.

What is the recommended approach for sites that have integrations like a oauth authentication or web mapping that need code to be run only in the browser (not SSR)? I have read about checking for module or browser and using babel dynamic import. Is there a way to have a separate bundle lazy loaded only when loaded in the browser?  
Check out https://www.gatsbyjs.org/docs/building-a-site-with-authentication/

How can you trigger a content refresh on the Gatsby site (frontend) when using gatsby-source-wordpress with a Wordpress CMS?  
You create a webhook on your CMS, and point the webhook at your CI system (eg Netlify).

To use gatsby for a blog - is this overengineering?  
Definitely not! Here are some blogs built with Gatsby: https://www.gatsbyjs.org/showcase/?filters%5B0%5D=Blog. One notable one is Dan Abramov — https://overreacted.io/

It was mentioned Gatsby has an upper limit of 50K pages, is that before you need to increase nodes memory or an upper limit written into Gatsby's build process?  
Not a strict upper limit, more of a rough one that we've seen in the wild.

What are some best practices around aligning (dynamic) CMS content schema with code changes in Gatsby?  
Great question - and we have some thoughts here. We're launching cloud services to tackle this very problem in 2019. In the interim--most CMSs have some type of webhook content, so you can trigger a re-build (static content is cheap, and so are changes!) when content changes.

You mention not having to worry about the web server, but what about the APIs that handle the order flow? Are those just separate API servers?  
Exactly, yep. You'll almost certainly have to worry about some servers, but it's incredibly freeing to not have to worry about your UI going down! Nice thing of going static/build-time SSR is that you're isolated from your API going down if you are able to generate static content from your API.

Is it overkill to build every site with Gatsby.js?  
We don't think so :)

Does Gatsby provide a polyfill for IntersectionObserver (for older browser which don't support it)?  
Not by default as it's rather heavy. There's docs on how to do this though if you want to support it. It's a progressive enhancement so things will all still work in older browsers. They just won't as efficient.

Have you implemented a rich text field from Contentful? If so, were you able to get gatsby-image working with embedded images in the rich text field?  
Gatsby works with Contentful rich text in beta right now. If you have specific Qs about the status, you can raise as a GH issue

Hi, I have a site built on Drupal 7. How easy would it be to migrate to Gatsby with say Netlify as a CDN?  
gatsby-source-drupal only supports Drupal 8 atm I believe https://www.gatsbyjs.org/packages/gatsby-source-drupal/?=drupal

Does Gatsby also have a solution for optimizing the experience of videos out of the box? Like gatsby-image for videos?  
Not atm. Video is harder to work with than images as video processing is very CPU intensive. We'd love to find a solution that works with video providers like YouTube, Vimeo, etc.

Dustin mentioned a recording on building dynamic apps with Gatsby. Is that available?  
Yes- you find that recording here: https://www.gatsbyjs.com/build-web-apps-webinar

Gatsby transformers support Markdown and asciidoc.  Possible support for Sphinx reStructuredText?  
Certainly! Gatsby is super pluggable, so whatever content you want to bring to Gatsby, just need to write a plugin! https://www.gatsbyjs.org/docs/create-source-plugin/

Would it be a good idea to manage several blogs or sites from one wordpress install as back office, and build all the sites on Gatsby  
That would be a great idea! We've talked to some folks doing this.

Do you think there will be a market for Gatsby premium themes (like for wordpress)?  
Yep :) it's on the roadmap!

Is Gatsby production ready? It's fantastic!  
Yep! Here are some sites using Gatsby in production: https://www.gatsbyjs.org/showcase/ (includes the Flamingo e-commerce site which will be presenting about their experience in about 10m)

Is there a good write up of how Gatsby compares to other static site generators (e.g. NextJS)? If so, where is it?  
Here's a good overview, although doesn't tackle Next specifically: https://www.gatsbyjs.org/features/

From an SSR perspective, how is Gatsby different from Next.js?  
Gatsby does SSR at "build-time" — which means all the SSRing is done _before_ a user requests a page which means your app loads really fast and it's easy to run and scale. Next.js does SSR at runtime which means that you need running servers to handle traffic and have to handle caching and scaling of servers in response to traffic.

Beyond blogs and ecommerce websites, what other use cases are you seeing people building with Gatsby?  
We see all use cases....dynamic apps, ecommerce, financial services, docs sites, etc. Docs sites, portfolios, company marketing sites, are all very common!

Is it possible to have the gatsby-*.js files be rewritten in TypeScript?  
gatsby-browser.js and gatsby-ssr.js work just fine if you add gatsby-plugin-typescript. We don't have a out-of-the-box solution for gatsby-node.js but you could require the typescript interpreter and then require another typescript file and re-export its code from gatsby-node.js

Hi, can we access to previous recorded webinars  
https://www.gatsbyjs.com/resources/webinars/,Yes- they're all posted on our website here: https://www.gatsbyjs.com/resources/webinars/

I'm new to GraphQL and probably haven't dug deep enough yet, but it's not clear to me how to add new properties and surface them in GraphQL., so my components can consume it.  
You can start with https://www.gatsbyjs.org/docs/using-gatsby-without-graphql/ and go from there!

Is it possible to dictate code splitting manually, e.g. component level code splitting?  
Yup! React.Lazy is great + standard async imports

Why is it called Gatsby? Maybe I missed the introduction to that.  
Kyle chose that name as he's a big fan of literature and The Great Gatsby gave him some inspiration :)

Can we pre-fetch video thumbnail image without pre-fetching entire videos until clicked on?  
That was just an example--we don't actually pre-fetch any video content! In general, prefetching is a great performance optimization technique that you _want_ to use and your users will thank you!

How can I use gatsby-image for images in the content body like a wordpress post?  
That's a bit tricky as the content body is a HTML string. There's issues talking about how to make this happen so jump into the discussion and help out!

How would you recommend handling Gatsby pointing to environment specific endpoints? For example, we're required to deploy the same artifact to dev - uat - prod, so for pointing our app at the appropriate endpoint, we're looking at location.href and using if/else to determine the endpoint. Is there a better way?  
Check out https://www.gatsbyjs.org/docs/environment-variables/ for env variables

How do you automate testing for performance regression  
Build Lighthouse into your CI pipeline

Would you briefly overview Continuous Integration (CI) and the process when a test fails?  
Sure! So CI is oftentimes used as a sanity check. We can run unit tests, e2e tests, and/or a linter. We can use these checks to give us some degree of confidence that we aren't introducing a regression, whether that regression is failing tests, performance regression, etc. I'll take a note of this and perhaps write a post on this--I think we have a great setup for our GatsbyJS repo!

Is there any way to only build new or updated contents instead of the full site?  
Not currently - but this is on our road map. We're calling it "incremental re-builds," and we're super excited to begin working on this!

Is it necessary to use GraphQL for work with Gatsby ?  
Nope! https://www.gatsbyjs.org/docs/using-gatsby-without-graphql/