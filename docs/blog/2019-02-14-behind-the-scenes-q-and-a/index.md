---
title: "Behind the Scenes Q & A: What Makes Gatsby Great Webinar"
date: 2019-02-14
author: Linda Watkins
tags:
  - performance
image: "./images/what-makes-gatsby-great.png"
showImageInArticle: true
---

We recently held a webinar, [Behind the Scenes Webinar](https://www.gatsbyjs.com/behind-the-scenes/), on what makes Gatsby so fast, with performance optimization out of the box. During the live event, we got over 100 questions that we want to share with you here. There’s a mix of topics from how we do image optimization, route-based code splitting, prefetching of routes with intersection observers, and more. Read on to get the answers to all the webinar questions as well as links to learn more.

To watch the full recorded webinar, [register here](https://www.gatsbyjs.com/behind-the-scenes/).

## Question Categories

- [Functional Questions](#functional-questions-how-do-i-do-x-with-gatsby)
- [GraphQL / Data Layer](#graphql--data-layer)
- [Best Practices with Gatsby](#best-practices-with-gatsby)
- [Content Management Systems (CMS)](#content-management-systems-cms)
- [Gatsby for Dynamic Web Apps](#gatsby-for-dynamic-web-apps)
- [Gatsby vs. Competitors](#gatsby-vs-competitors)
- [Scaling Gatsby (Gatsby for Large Apps)](#scaling-gatsby-gatsby-for-large-apps)
- [Gatsby Use Cases](#gatsby-use-cases)
- [Misc. Questions](#misc-questions)

### Functional Questions (How do I do X with Gatsby?)

**Question:** Can I serialize an api to be stored and accessed client-side only?
**Answer:** Yup (with a source plugin!). If it's a GraphQL API you can even use [`gatsby-source-graphql`](/packages/gatsby-source-graphql/) to invoke that API at _build time_

**Question:** How would you recommend handling Gatsby pointing to environment specific endpoints? For example, we're required to deploy the same artifact to dev - uat - prod, so for pointing our app at the appropriate endpoint, we're looking at location.href and using if/else to determine the endpoint. Is there a better way?
**Answer:** Check out [Environment Variables](/docs/environment-variables/).

**Question:** Is it possible to have the gatsby-\*.js files be rewritten in TypeScript?
**Answer:** gatsby-browser.js and gatsby-ssr.js work just fine if you add gatsby-plugin-typescript. We don't have a out-of-the-box solution for gatsby-node.js but you could require the TypeScript interpreter and then require another TypeScript file and re-export its code from gatsby-node.js.

**Question:** Gatsby transformers support Markdown and asciidoc. Possible support for Sphinx reStructuredText?
**Answer:** Certainly! Gatsby is super pluggable, so whatever content you want to bring to Gatsby, just write a plugin! Check out [Creating a Source Plugin](/docs/creating-a-source-plugin/).

**Question:** How did you implement the GitHub PR test for lighthouse scoring?
**Answer:** All available in [`gatsby-perf-audit`](https://github.com/dschau/gatsby-perf-audit). I run Lighthouse from a CI container, and then parse the response.

**Question:** Is it possible to dictate code splitting manually, e.g. component level code splitting?
**Answer:** Yup! React. Lazy is great + standard async imports.

**Question:** How can I expose global variables during the build process? We are looking to use JSDom during the build process. We currently have the async loading of the Interweave module, but we want our ssr generated html to match the final rendered DOM.
**Answer:** Check out [Environment Variables](/docs/environment-variables/).

**Question:** Is there a way to enable SSR on run time to things like a post preview?
**Answer:** If you mean a screenshot of the built site, you could deploy to a staged URL, and then use a plugin like [`gatsby-transformer-screenshot`](https://github.com/gatsbyjs/gatsby/tree/master/packages/gatsby-transformer-screenshot) and then query for your page preview (we do this on gatsbyjs.org!). Additionally, something like using [a screenshot service](https://screenshot-v2.now.sh/) would work, as well. We're working on a service for this: [Gatsby Preview](/blog/2018-07-17-announcing-gatsby-preview/)

**Question:** How do you automate testing for performance regression?
**Answer:** Build Lighthouse into your CI pipeline.

**Question:** As a follow up to DB question, the tutorials give an example of building pages from markdown files. Would that same approach be possible from DB queries?
**Answer:** Yep!

**Question:** Can I use Gatsby Image with images from external sources like Cloudinary or an AWS bucket? And if it's indeed possible, will this impact my build time if I have thousands of images?
**Answer:** Yes, build-times do go up with image processing as it's very CPU intensive.

**Question:** I have an app which has Frontend and Admin Panel so how do I do code splitting based on Module so the admin javascript should not include in Frontend and vice versa?
**Answer:** Gatsby splits code automatically by route so code only used on the admin panel will only be loaded there. Check out [Building Apps with Gatsby](/docs/building-apps-with-gatsby/) for details about how to build the admin section.

### GraphQL / Data Layer

**Question:** How does Gatsby work with GraphQL APIs? Create static pages with the content or only when it renders the page?
**Answer:** With third party GraphQL APIs — [GraphQL Support](/blog/2018-09-25-announcing-graphql-stitching-support/)

**Question:** Is it necessary to use GraphQL for work with Gatsby?
**Answer:** Nope! [Using Gatsby without GraphQL](/docs/using-gatsby-without-graphql/)

**Question:** I'm new to GraphQL and probably haven't dug deep enough yet, but it's not clear to me how to add new properties and surface them in GraphQL, so my components can consume it.
**Answer:** You can start with [Using Gatsby without GraphQL](/docs/using-gatsby-without-graphql/) and go from there!

### Best Practices with Gatsby

**Question:** How are static assets handled with Gatsby? What is the best approach when using larger amount of SVG icons (think emojis) which may increase the bundle size by more than 100kb's?
**Answer:** There's a few ways you can handle it. See this docs section which talks about the various options: [Images, Files, and Video](/docs/images-and-files/)

**Question:** The question asked about search—how would you implement a site search in Gatsby?
**Answer:** One of the best things about Gatsby is that it's pretty agnostic on tech stack(s). So you're free to use what you want. I've used Algolia in the past and loved it, but you're free to implement this however you'd like! [Adding Search](/docs/adding-search/)

**Question:** Any advice for running automated performance tests for sites that are hidden behind a login page?
**Answer:** A CI can do a build and then run the lighthouse test on the built site.

**Question:** Regarding Environment Variables and security- how do we keep secure endpoints using env vars like process.env to handle authorization keys and secrets? Does this mean Node would be required in prod environment?
**Answer:** Yes, process.env is recommended for secret management. [Environment Variables](/docs/environment-variables/). Generally you'd add these to gatsby-config.js — so would be used for the build but wouldn't be sent to users, so the keys wouldn't leak.

**Question:** What is your opinion on using CSS, i.e. Styled Components, Emotion or BEM?
**Answer:** We don't really have an official opinion--we want you to build apps however you prefer! That being said, I quite like CSS in JS (particularly emotion). I did a little podcast with Chris Coyier if you're interested--[CSS-in-JS Podcast on CSS Tricks](https://css-tricks.com/video-screencasts/168-css-in-js/)

**Question:** How about best practices with Styles and Web Fonts?
**Answer:** Re: Styles, I'd recommend using something like CSS Modules (enabled by default!) or a CSS in JS solution if you're into that. We're not opinionated and want to enable everyone to build performant sites, by default! As far as web fonts, depends! You could use gatsby-plugin-typography and load google fonts if that's your thing. [Typefaces](https://github.com/kyleamathews/typefaces) lets you add open source fonts from NPM packages.

### Content Management Systems (CMS)

**Question:** Will Gatsby compile/export static files using the theme from a Ghost installation or will Gatsby compile/export based on another Gatsby theme?
**Answer:** When you use Gatsby + Ghost you will construct UI in Gatsby rather than Ghost -- [Modern publications with Gatsby & Ghost](/blog/2019-01-14-modern-publications-with-gatsby-ghost/)

**Question:** Should I stop using WordPress altogether? Does WordPress play well with Gatsby or is Contentful better? Looks like JAMstack is a WordPress killer.
**Answer:** It's not a 100% replacement yet — best to start experimenting with things and see how it feels!

**Question:** How do content managers preview their changes?
**Answer:** We have some tooling planned for this :) Stay tuned! [Announcing Gatsby Preview
](/blog/2018-07-17-announcing-gatsby-preview/)

**Question:** Is there a good starting point to compare building sites with Gatsby that developers would have built on platforms like WordPress or Craft, etc previously?
**Answer:** People have written about their experiences on our blog. Here are some [blog posts about WordPress](/blog/tags/wordpress).

**Question:** What are best practices for making a Gatsby site dynamic by posting/fetching to/from a DB, like MongoDB, MySql, etc..
**Answer:** You can use a DB as your backend -- [Sourcing from Databases](/docs/sourcing-from-databases/). Posting to a database can be done with AJAX requests.

**Question:** What are your thoughts on sanity.io?
**Answer:** Seems great :) Check out this blog post for more info: [Blazing fast development with Gatsby and Sanity.io](/blog/2019-01-25-blazing-fast-development-with-gatsby-and-sanity-io/)

**Question:** What are some best practices around aligning (dynamic) CMS content schema with code changes in Gatsby?
**Answer:** Great question - and we have some thoughts here. We're launching cloud services to tackle this very problem in 2019. In the interim--most CMSs have some type of webhook content, so you can trigger a re-build (static content is cheap, and so are changes!) when content changes.

**Question:** Would it be a good idea to manage several blogs or sites from one WordPress install as back office, and build all the sites on Gatsby?
**Answer:** That would be a great idea! We've talked to some folks doing this.

**Question:** If a company had numerous content managers (let's say 30), and they all needed to be able to create and publish content to a blog (which could be multiple on the same site) or a page, each update would require a new build? Is that an accurate understanding?
**Answer:** We're building a service for Preview that'll instantly update a staging version of the site and that can handle as many content updaters as you throw at it: [Gatsby Preview](/blog/2018-07-17-announcing-gatsby-preview/).

**Question:** The Preview feature is awesome. But I'm thinking like a 24 hours news channel, which our company has, and a manager needing to post content at 2 am, or even more, stories being posted multiple times an hour at all hours. Will each update require a new build?
**Answer:** Yes. Builds are fast and automatic though so doesn't take any extra work or mental overhead.

**Question:** How can I use gatsby-image for images in the content body like a WordPress post?
**Answer:** That's a bit tricky as the content body is a HTML string. There's issues talking about how to make this happen so jump into the discussion and help out.

**Question:** Is there a 3rd party CMS that you recommend that works particular well with Gatsby?
**Answer:** Lots of CMS-s! Here's a list: [Headless CMS](/docs/headless-cms/)

**Question:** How can you trigger a content refresh on the Gatsby site (frontend) when using gatsby-source-wordpress with a WordPress CMS?
**Answer:** You create a webhook on your CMS, and point the webhook at your CI system (eg Netlify).

**Question:** I have a site built on Drupal 7. How easy would it be to migrate to Gatsby with say Netlify as a CDN?
**Answer:** [`gatsby-source-drupal`](/packages/gatsby-source-drupal/) only supports Drupal 8 at the moment, I believe.

**Question:** Have you implemented a rich text field from Contentful? If so, were you able to get gatsby-image working with embedded images in the rich text field?
**Answer:** Gatsby works with Contentful rich text in beta right now. If you have specific Qs about the status, you can raise as a GH issue.

### Gatsby for Dynamic Web Apps

**Question:** Are there data fetching hooks that we can use for client-side loading of authenticated content that isn't serialized at build-time?
**Answer:** Check out [Building a site with authentication](/docs/building-a-site-with-authentication/) and [Building Apps with Gatsby
](/docs/building-apps-with-gatsby/)

**Question:** How to do SSR loading for Dynamic content- for example, a blog, as it uses build time SSR technique?
**Answer:** Gatsby's data layer and source plugins can fetch data dynamically at build time to grab your data. Then whenever your data changes, you rebuild your site with the updated content. Builds are fast so you can update the site every few minutes if necessary.

**Question:** Is Dynamic content SEO Friendly when we use data layer ?
**Answer:** Yep! Check out [SEO with Gatsby
](/docs/seo/)

**Question:** How do you keep on top of things like price changes and stock availability with a static generated site?
**Answer:** We actually do this on the GatsbyJS store. Check out the code, and hope it's helpful: [Gatsby Swag Store](https://github.com/gatsbyjs/store.gatsbyjs.org)

**Question:** Would it makes sense to still use Gatsby for a more "dynamic" type of app?
**Answer:** Yes! You can learn more about what types of dynamic apps you can build with Gatsby here: [Dynamic Apps Webinar](https://www.gatsbyjs.com/build-web-apps-webinar).

**Question:** What is the recommended approach for sites that have integrations like a oauth authentication or web mapping that need code to be run only in the browser (not SSR)? I have read about checking for module or browser and using babel dynamic import. Is there a way to have a separate bundle lazy loaded only when loaded in the browser?
**Answer:** Check out [Building a site with authentication](/docs/building-a-site-with-authentication/).

**Question:** Dustin mentioned a recording on building dynamic apps with Gatsby. Is that available?
**Answer:** Yes- you find that recording here: [Gatsby Building Apps Webinar](https://www.gatsbyjs.com/build-web-apps-webinar).

### Gatsby vs. Competitors

**Question:** What is the main difference between Gatsby and react-static?
**Answer:** React-static is a subset of Gatsby — it lets you programmatically create pages like Gatsby and has a limited plugin system but doesn't have a data layer for connecting to 3rd party APIs or transforming markdown and images.

**Question:** Is there a good write up of how Gatsby compares to other static site generators (e.g. NextJS)? If so, where is it?
**Answer:** Here's a good overview, although doesn't tackle Next specifically: [Gatsby features](/features/)

**Question:** From an SSR perspective, how is Gatsby different from Next.js?
**Answer:** Gatsby does SSR at "build-time" — which means all the SSRing is done _before_ a user requests a page which means your app loads really fast and it's easy to run and scale. Next.js does SSR at runtime which means that you need running servers to handle traffic and have to handle caching and scaling of servers in response to traffic.

### Scaling Gatsby (Gatsby for Large Apps)

**Question:** I'm working for a e-Commerce company. We have millions of products in our shop. The product detail site is somewhat the same but for the data. Is there a way to generate all those pages for each of those products in a feasible time?
**Answer:** Gatsby generally maxes out at 50k pages or so (right now) but you could break up the page, check out [Building a large, internationalized e-commerce website with Gatsby at Daniel Wellington
](/blog/2019-01-28-building-a-large-ecommerce-website-with-gatsby-at-daniel-wellington/)

**Question:** How do you suggest to setup delta builds? Say I have 10 pages and am changing only one. Is it possible to build just the one and not all 10?
**Answer:** This is incremental builds! We're thinking on it and certainly want to deliver this feature--it'd be a great one!

**Question:** How does Gatsby handle builds of a thousand pages? Let's say I've already run Gatsby build before to build it and then only one page has been changed, does Gatsby knows how to build only the pages that were changed?
**Answer:** We don't yet have incremental builds, but 1000 page sites should build relatively quickly (a couple of minutes). Stay tuned on incremental builds!

**Question:** You mentioned 'Incremental builds' on another question, can you point me to where I can read more about the ideas and status?
**Answer:** Some prior art here: [issue #5002](https://github.com/gatsbyjs/gatsby/issues/5002) and [issue #9083](https://github.com/gatsbyjs/gatsby/issues/9083) Once we're ready to start implementing, we'll most likely create an RFC and solicit community feedback for the functionality. We haven't talked too much about it publicly, but you can read a general overview in our company launch post which talks about our long-term vision: [Distributed computing & event sourcing](/blog/2018-05-24-launching-new-gatsby-company/#distributed-computing--event-sourcing).

**Question:** It was mentioned Gatsby has an upper limit of 50K pages, is that before you need to increase nodes memory or an upper limit written into Gatsby's build process?
**Answer:** Not a strict upper limit, more of a rough one that we've seen in the wild.

**Question:** Is there any way to only build new or updated content instead of the full site?
**Answer:** Not currently - but this is on our roadmap. We're calling it "incremental re-builds," and we're super excited to begin working on this!

### Gatsby Use Cases

**Question:** To use gatsby for a blog - is this overengineering?
**Answer:** Definitely not! [Here are some blogs built with Gatsby](/showcase/?filters%5B0%5D=Blog). One notable one is Dan Abramov's — [https://overreacted.io/](https://overreacted.io/)

**Question:** Is it overkill to build every site with Gatsby.js?
**Answer:** We don't think so :)

**Question:** Do you think there will be a market for Gatsby premium themes (like for WordPress)?
**Answer:** Yep :) it's on the roadmap!

**Question:** Beyond blogs and ecommerce websites, what other use cases are you seeing people building with Gatsby?
**Answer:** We see all use cases....dynamic apps, ecommerce, financial services, docs sites, portfolios, and company marketing sites are all very common!

**Question:** Who does the Gatsby team consider its users? Content creators? Engineers? Other?
**Answer:** All of the above!

**Question:** Is Gatsby production ready? It's fantastic!
**Answer:** Yep! Here are some sites using Gatsby in production: [Gatsby Showcase ](/showcase/)(includes the Flamingo e-commerce site).

### Misc. questions

**Question:** There's a way to use A/B Tests with Gatsby? Any plans to support Unleash Feature Toggle implementation?
**Answer:** You can do this client-side, there isn't any good out-of-the-box documentation on how to do this right now though. If you do it, write it up!

**Question:** What is a 'route'?
**Answer:** Basically a URL, eg `/blog/{post-name}`

**Question:** Should i know React before starting to learn Gatsby?
**Answer:** You don't need to! Gatsby is a great playground for learning React. Check out this post: [How Gatsby scales with your expertise & scope](/blog/2018-12-19-gatsby-scales-with-expertise-and-scope/)

**Question:** You mention not having to worry about the web server, but what about the APIs that handle the order flow? Are those just separate API servers?
**Answer:** Exactly, yep. You'll almost certainly have to worry about some servers, but it's incredibly freeing to not have to worry about your UI going down! Nice thing of going static/build-time SSR is that you're isolated from your API going down if you are able to generate static content from your API.

**Question:** What CI system did you use for the (Harry’s [shopflamingo.com](https://www.shopflamingo.com/)) website?
**Answer:** CircleCI. it's incredible, definitely check it out.

**Question:** Can we pre-fetch video thumbnail images without pre-fetching entire videos until clicked on?
**Answer:** That was just an example--we don't actually pre-fetch any video content! In general, prefetching is a great performance optimization technique that you _want_ to use and your users will thank you.

**Question:** I have a page template that can render different components(50+) according to the page query response. Will those components be then bundled in every page that uses that template?
**Answer:** Yes — if possible, you can lazy load components as that'll move the code into their own bundle which will only be loaded on demand.

**Question:** Would you briefly overview Continuous Integration (CI) and the process when a test fails?
**Answer:** Sure! So CI is oftentimes used as a sanity check. We can run unit tests, e2e tests, and/or a linter. We can use these checks to give us some degree of confidence that we aren't introducing a regression, whether that regression is failing tests, performance regression, etc. I'll take a note of this and perhaps write a post on this--I think we have a great setup for our GatsbyJS repo.

**Question:** On mobile, where a user is not able to hover, how does this prefetching method differ?
**Answer:** Prefetching starts when a link appears on the screen so it works on mobile very well.

**Question:** Does the lazy-loading technique apply to images hosted on a cloud based management service such as Cloudinary?
**Answer:** There would need to be support added for Cloudinary. There's been talk about this but nobody has built it yet. Some CMSs like Contentful, Datocms, and sanity.io have added support gatsby-image.

**Question:** Does Gatsby provide a polyfill for IntersectionObserver (for older browser which don't support it)?
**Answer:** Not by default as it's rather heavy. There's docs on how to do this though if you want to support it. It's a progressive enhancement so things will all still work in older browsers. They just won't be as efficient.

**Question:** Is there a good upgrade path for new versions of Gatsby?
**Answer:** Unless you're on v1, you won't need a migration. If you are on v1 and want to move to v2, check out [Migrating from v1 to v2](/docs/migrating-from-v1-to-v2/).

**Question:** Following up on upgrade path question—how would you upgrade between version of 2.\~?
**Answer:** You can bump the version # in your package.json and then you're done.

**Question:** If my .htaccess file is configured to read .html files without the extension in the url, can Gatsby compile the links to pages without the .html ending?
**Answer:** We haven't added support for this yet.

**Question:** Follow up to the .htaccess question, how do you manage to hide .html from your url on gatsbyjs.com?
**Answer:** Many servers can do this. Generally the feature is called "clean urls".

**Question:** No concern of the additional request for the SVG??
**Answer:** SVGs previews are inlined.

**Question:** No concerns of excessive prefetching in the bg?
**Answer:** This is turned off on low-power devices.

**Question:** Re content updates: But is a new build triggered on _every_ content change?
**Answer:** You can configure it that way -- send webhooks to have your CI server rebuild.

**Question:** Can you talk more about Themes & how to create custom themes for V2?
**Answer:** Look at [Introducing Gatsby Themes blog post](/blog/2018-11-11-introducing-gatsby-themes/) and [Introducing Gatsby Themes video](https://www.gatsbyjs.com/gatsby-days-themes-chris/) and stay tuned for more posts in next week!

**Question:** Does Gatsby also have a solution for optimizing the experience of videos out of the box? Like gatsby-image for videos?
**Answer:** Not at the moment. Video is harder to work with than images as video processing is very CPU intensive. We'd love to find a solution that works with video providers like YouTube, Vimeo, etc.

**Question:** Can we access previously recorded webinars?
**Answer:** Yes- they're all posted on our website here: [Gatsby Webinars](https://www.gatsbyjs.com/resources/webinars/)

**Question:** What's the best way to get involved with contributing to Gatsby? Do you have regular calls for contributors or a preferred async channel e.g. Slack / Discord?
**Answer:** We do have Discord, and highly recommend it! Check out our [Community page](/contributing/community/).

---

Reminder that if you want to watch the full recorded webinar, [register here](https://www.gatsbyjs.com/behind-the-scenes/). Thanks for stopping by!
