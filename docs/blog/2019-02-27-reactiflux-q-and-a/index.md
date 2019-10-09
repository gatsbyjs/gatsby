---
title: "Q and A: Reactiflux and the Gatsby Team"
date: 2019-02-27
author: Linda Watkins
canonicalLink: https://www.reactiflux.com/transcripts/gatsby-team/
---

Below is a transcript of an interview with Kyle Mathews, Chris Biscardi, and Dustin Schau that took place on the [Reactiflux Discord](https://reactiflux.com). Thanks to the Reactiflux team for organizing this Q&A and writing the original post (https://www.reactiflux.com/transcripts/gatsby-team/). Read on to hear members of the Gatsby team answer the most burning questions about Gatsby.

Date of interview: December 13 2018

---

**Q:** How do you see the future of Browser-apps/PWA in comparison to "old2 executables" on windows? — spYro

**A:** I think the future of browser apps is bright :smiley: more and more software (particularly business software) is delivered over the web (or Electron for desktop apps). Web developer tooling and browsers get an incredible amounts of investment and most people find building with html/css/js much nicer than the equivalent native UI toolkits. So I expect the strong trend to deliver applications over the internet or through Electron-like solutions to continue.

— kylemathews

---

**Q:** Any progress in making react hooks work in v2? — Sylenth1

**A:** React hooks was broken by React Hot Loader. They've been working hard on fixing the incompatibility and [their recent 4.6.0 release](https://medium.com/@antonkorzunov/react-hot-loader-4-6-41f3ce76fb08) looks like things are working! There's [a WIP PR to upgrade Gatsby to this release](https://github.com/gatsbyjs/gatsby/pull/10455) so we should be solid very soon.

— kylemathews

---

**Q:** Any plans for custom hooks in Gatsby? — alexanderson1993

**A:** No plans just yet for custom hooks — most of our efforts with Gatsby are making integrations with custom data services (CMSs, ecommerce, etc.) really smooth along with making builds super scalable and fast — React hooks are an amazing improvement for client-side React code but not sure yet if there's any hooks we'd want to build ourselves.

— kylemathews

---

**Q:** When would I choose gatsby over next js — f_youngblood

**A:** Gatsby and Next are similar in many respects, but Gatsby is hyper-focused on baking performance in by default and in the ecosystem with approaches like the offline-plugin, etc. Personally I'd default to starting with gatsby and move to next only if I couldn't find a way to prerender my SEO critical applications.

— biscarch

---

**Q:** What is the future of Gatsby beyond v2? — kdichev

**A:** Improving integrations with hosted services (CMSs etc) often used with Gatsby + improving Gatsby build speeds — we're working to support very large sites in new year e.g. 1 million+ pages.

We're also working on adding [Gatsby Theme support](/blog/2018-11-11-introducing-gatsby-themes/) which @biscarch is leading.

— kylemathews

---

**Q:** Is Gatsby ready to be used with dynamic Apps and an equivalent alternative to CRA by now? For example, a couple of months ago it was not possible yet to use Apollo Client (as in post-build to make dynamic requests to a GQL server from the client-side). Is this available now and are there any other limitations? In general, it has been confusing for me to understand why to use Gatsby for dynamic apps in the first place. It has been clearly advertised as a static site generator after all. Could you shed some light on that? Thanks! — tiny

**A:** Yes. You can see how to approach using apollo-client in examples like [the gatsby store repo](https://github.com/gatsbyjs/store.gatsbyjs.org). "Static site generator" is a bit of a misnomer, since Gatsby melds pre-rendering with a fully bootstrapable performant application like you'd get with something like CRA.

— biscarch

---

**Q:** When should we not choose Gatsby to start a React project? — alexluong

**A:** Hmmm probably the main time you wouldn't want to use Gatsby is if you're building a purely client-side React app that needs to fit within an existing site/app — Gatsby wants to control the site/app (at least its section). We like to describe Gatsby as CRA++ — you have a very similar setup to CRA but you also get built-in plugin support (e.g. for tweaks to webpack), SSR, data layer for pulling in data from services, plus really optimized performance and client-side preloading.

— kylemathews

---

**Q:** Is there any specific place for documented or known issues with the react component lifecycle/prerendering in v2? I have a website that renders images correctly using gatsby build and serve, but when deployed to a CDN it seems my component never starts its animation and images are stuck with 0 opacity. (no asset optimization or configured prerendering selected on the CDN) — Tyler Churchill

**A:** Yes, (this is GitHub issues)[https://github.com/gatsbyjs/gatsby/issues] which you should definitely file an issue for so we can investigate your issue in depth.

— biscarch

---

**Q:** How far down the roadmap are incremental builds? — ghardin137

**A:** Pretty close! We're working on creating a hosted Gatsby build service which will include incremental build support. We should be able to launch that in first half of next year. We're focused right now on launching [Gatsby Preview](/blog/2018-07-17-announcing-gatsby-preview/) and then this will be the next thing we'll tackle.

— kylemathews

---

**Q:** Do you hope or believe that gatsby (and JAM-stack in general), headless CMS's and microservices will overcome rigid and outdated WordPress sites and architecture? — max

**A:** Yup! That's why I started [the Gatsby OSS project and company](/blog/2018-05-24-launching-new-gatsby-company/)! CMSs we're designed in the late 1990s and are very outdated for today's cloud/serverless computing environment. We want Gatsby to be able to replace CMSs.

— kylemathews

---

**Q:** What's the roadmap for Gatsby themes? When would it graduate from "experimental" feature? — alexluong

**A:** It will graduate from experimental when we're confident in supporting the API for the lifecycle of gatsby 2. Currently I'm reaching out to people who have built starters and talking them through converting starters to themes. I anticipate that this is when we'll find any breaking changes that need to happen, with future feedback loops being smaller ease of use type fixes.

— biscarch

---

**Q:** Will we be able to use incremental builds outside of the gatsby.com service? — ghardin137

**A:** Not yet clear — shipping fast incremental builds requires tight control over the build server to ensure caching + build execution is optimal. That + our top priority as a project & company is ensuring its long-term sustainability so finding premium commercial features that companies are happy to pay for — incremental builds will be a transformational feature that'll let many web projects move to take advantage of Gatsby's performance and low operational costs — so as incremental builds is a natural fit for a specialized cloud service and a premium feature that most smaller sites don't need — our plan is to ship it first to the gatsbyjs.com service and then evaluate later shipping it in OSS.

— kylemathews

---

**Q:** Where would you like to see gatsby in a few years, what is your vision / long-term goal with it? — mo

**A:** We want to create a wonderful inclusive community where people and companies build their livelihoods around Gatsby. We're investing heavily in the OSS community and learning resources. If we're successful, there'll be millions of sites built with Gatsby and 100s of thousands of developers and designers using Gatsby every day.

— kylemathews

---

**Q:** As a jaded javascripter who is getting tired of the whole 'new framework of the week', why should I care about Gatsby over other projects? Why would it be worth my time to help build the Gatsby community and contribute my time to creating plugins and troubleshooting the inevitable bugs that it will bring? What makes you special? — PenguinMan98

**A:** From a technical perspective, Gatsby has a powerful approach to managing data and a performance sensitive mindset. This means that you get to spend less time "making sure the site is performant" and more time building your product.

While it's inevitable that bugs come with any platform you choose to build on, Gatsby has been around for a few years now and hopefully during that time (which you can go check us on) we've proven that your contributions will be accepted and appreciated.

— biscarch

---

**Q:** Is there some sort of change list or changelog? I have had problems finding one in the past, for gatsby and its packages. — Everspace

**A:** There are per-package changelogs maintained in each package, for example [Gatsby's](https://github.com/gatsbyjs/gatsby/blob/master/packages/gatsby/CHANGELOG.md).

— biscarch

---

**Q:** Is there any plan to make Gatsby GraphQL-schema first, so is more "robust", instead of Gatsby building a schema out of the data-source. The main problem I'm facing is that data can change dynamically, GraphQL schema changes accordingly.. and this breaks GraphQL queries. I see others with the same problem. No easy solution. — monotono

**A:** Yeah — this is a top priority — we've been a bit overwhelmed post v2 launch handling issues/PRs but our we've thought a lot about this problem and next steps are a) [make it possible to export your schema and directly control it](https://github.com/gatsbyjs/gatsby/issues/4261).

We're also very excited that more and more services are offering native GraphQL APIs which gets us out of having to dynamically create the schema. We added [support for stitching in graphql schemas](/blog/2018-09-25-announcing-graphql-stitching-support/) earlier this year and have a lot more plans to make schema stitching more powerful e.g. [add support for transforming data from 3rd party schemas](https://github.com/gatsbyjs/rfcs/pull/11).

— kylemathews

---

**Q:** Any info on contributing to the codebase or documentation greatly appreciated. Any tips that might not be in the official How To, or a contact if applicable/available. Thank you for your time — seanmoore1976

**A:** Definitely! So I'd recommend starting with the [How to Contribute guide](/docs/how-to-contribute/).

It's a great place to get started. That said, I'd also encourage to check out [a Pairing session](/docs/pair-programming/), where a Gatsby employee and you will pair 1:1 for about an hour or so to work on a problem or challenge you've run into. We've had some really good stuff come out of pairing sessions, and I think people really like them as a way to get started contributing!

— dustin

---

**Q:** How is authentication handled in gatsby? — Reinhard

**A:** Great question! So in general, and I probably say it far too often, but a Gatsby app is just a React application.

So--however you implement authentication into a React application can be followed similarly with a Gatsby application, because a Gatsby app is a React application.

We do have [a guide/tutorial written here](/tutorial/authentication-tutorial/) which many have found helpful. Shameless shout out to my little side-project (just a demo, not a real product!) [gatsby-mail](https://github.com/dschau/gatsby-mail) which has user authentication (via React context) as well.

Check it out, and hope it's helpful!

— dustin

---

**Q:** What is the most exciting feature you are working right now? — Checkmatez

**A:** I'm very excited about themes right now. With the core functionality (composable gatsby configs and Component Shadowing) merged in as experimental, we can start to build very powerful abstractions for complete documentation sites, marketing sites, ecommerce sites, etc. I'm happy to talk to anyone in more depth about themes at any time either in the community spectrum (https://spectrum.chat/gatsby-themes) or on Twitter (https://twitter.com/chrisbiscardi)

A Gatsby email _application_. Contribute to DSchau/gatsby-mail development by creating an account on GitHub.

— biscarch

---

**Q:** What support will Gatsby team provide to .com clients and the idea behind it? — kdichev

**A:** Many of the largest OSS projects have commercial companies backing them. Complicated software is well... complicated :smiley: and requires a lot of investment to build and maintain. I founded Gatsby Inc to be an excellent steward of the project and ecosystem & provide support and services for commercial users of Gatsby. Most large companies that adopt open source want to pay for commercial support — we provide that. Also there's many cloud services we're building that'll add a lot of value to companies using Gatsby like the before mentioned [Gatsby Preview](/blog/2018-07-17-announcing-gatsby-preview/).

— kylemathews

---

**Q:** I have found developing plugins that create nodes or interact with the gatsby-api to be a big hassle in comparison to how pages and other content is developed. Is there any plans on making something like "hot-reload" nodes or generation during development without having to stop and start gatsby? — Everspace

**A:** Source and transformer plugins can "hot reload" data during development. Support for this is baked into Gatsby's data layer. It's a bit complicated to explain in a Q&A but basically a source plugin can watch for data to change and re-emit nodes. Gatsby will then notice this and automatically re-run graphql queries for pages affected by the changing data. gatsby-source-filesystem is the most prominent example of this. It watches for file changes and re-emits File nodes as the data changes. [This is what drives Ludicrous Mode™️](https://twitter.com/gatsbyjs/status/974507205121617920?lang=en) You can see the code for this [here](https://github.com/gatsbyjs/gatsby/blob/d4d33467bcff60ad3c740244d7585227d7e117ee/packages/gatsby-source-filesystem/src/gatsby-node.js#L129-L136).

— kylemathews

---

**Q:** Would be interested in the Gatsby team's take on this: What are currently the best and/or most up-and-coming tech locations in the world besides Silicon Valley? — tiny

**A:** The best up-and-coming tech locations are wherever you currently are. Distributed teams (like gatsby) are the future, especially when Open Source is already built largely by people who may have never even met in person

P.S. Gatsby is hiring worldwide for OSS Maintainers

— biscarch

---

**Q:** As a company do you have any plan in pursuing global partnerships? — yuchi

**A:** Yup! Gatsby works by creating tight integrations with great companies like contentful.com, datocms.com, sanity.io, shopify.com, etc. We're actively chatting with these folks and more about how to make our services work better together.

— kylemathews

---

**Q:** What about non-product partnership? — yuchi

**A:** We've started with [an agency partner program](/blog/2018-08-01-partner-program/) which we'll be talking about more soon — if interested, please sign up!

— kylemathews

---

**Q:** What is one thing that Gatsby is capable of doing that might surprise some people? — ctlee

**A:** Gatsby can be used to build fully dynamic sites, which surprises some people because of its label as a "static site generator". It's fully equipped to be a powerful alternative to create-react-app and other similar solutions with the addition of easy pre-rendering and perf baked in.

— biscarch

---

**Q:** Where can we find Gatsby job postings? — Rshig

**A:** Here's two!

https://www.gatsbyjs.com/careers/open-source-maintainer/

https://www.gatsbyjs.com/careers/cloud-services-engineer/

— kylemathews
