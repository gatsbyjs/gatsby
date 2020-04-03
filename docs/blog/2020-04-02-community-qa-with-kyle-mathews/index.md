---
title: "March 6th Community Q&A with Kyle Mathews"
date: 2020-04-02
author: "Kyle Mathews"
tags: ["gatsby-inc"]
---

We’ve started hosting regular Gatsby community Q&A chats with yours truly! The last one was on March 6th and the next one is scheduled for early May. They’re great fun to chat with the folks about things that are on their mind and talk about ongoing/upcoming work.

The [full video is on YouTube](https://www.youtube.com/watch?v=mGyUJvKjzXQ&feature=youtu.be) & I’ve written up many of the questions & my answers below.

## In 2018 you blogged about "a new version of Gatsby" with incremental and parallelizing builds—what's the status & roadmap for incremental builds with Gatsby?

I’m guessing this question is referring to [my blog post on the launch of our company in 2018](https://www.gatsbyjs.org/blog/2018-05-24-launching-new-gatsby-company/) and that supporting very fast deployments for everyone is our top goal as a company.

This has always been my goal with Gatsby. The Gatsby v1 architecture was designed specifically to support this. Here’s the original tweet announcing when the basic support for incremental builds was added to the framework in a 1.0 alpha:

https://twitter.com/kylemathews/status/856638851158220800

Gatsby has always used “incremental building” to drive developing on sites. When you edit a markdown file, Gatsby “incrementally” updates just the pages affected by that change to the markdown file.

The Gatsby cache, if saved between builds, also substantially increases the speed of builds by avoiding much of the rework.

As most of you know, [we recently launched our own continuous deployment product on Gatsby Cloud](https://www.gatsbyjs.org/blog/2020-01-27-announcing-gatsby-builds-and-reports/). Included in that was initial support for parallelizing parts of the build process — images to start with, and more to come.

That drove some impressive improvements to build speeds:

- [Third and Grove](https://www.thirdandgrove.com/) saw 60x build-time reductions from 60 minutes to 1 minute for their large 15,000 page, image-heavy Gatsby/Drupal site.
- [Gatsbyjs.org](https://gatsbyjs.org/) saw 9x reduced build times from 45 minutes to 5 minutes.
- Our [image processing benchmark site](https://github.com/KyleAMathews/gatsby-image-processing-test) saw 5x reduced build times from 200 seconds to 40 seconds.

**We’re working on a dramatically improved way to cache between builds (making builds even more “incremental”) that’ll make all site builds a lot lot faster.** We’ll be making more noise about this soon as we ready it for launch.

We want to make consistent < 10 second deploys a reality for everyone and any type of site & we’re very focused on making that happen.

## What is the roadmap on SSR support for Gatsby?

SSR (server side rendering) support is really critical for React websites. By default, React only runs in the client so it doesn't support bots from Google and social media sites, which hurts SEO and social sharing.

There are two flavors of SSR — build-time & run-time — both solve the problem of SEO/social sharing.

Gatsby has had build-time SSR support from the our first release in 2015. So Gatsby has always been a great choice for React apps that need SSR support.

Some people ask us to support runtime SSR as well. We often discuss doing that but have always to date decided to instead redouble our efforts to improve build-time SSR as frankly, it’s a lot better for everything.

Build-time SSR is incredibly less complex than runtime SSR. Operating build-time SSR sites is trouble free — you just build the site & push it to a CDN and don’t need to think about it anymore. Run-time SSR means you need running Node.js web servers to render the site...which means you have a lot of running code that can break, get overloaded, get memory leaks, and break in any number of other ways.

People tell us one of the main things they love about Gatsby is they sleep a lot better at night.

They don’t get alerted about website problems.

The only problem with build-time SSR right now is when builds are either not fast enough or can’t scale to the size of your site.

We’re razor focused right now on solving these two problems (see the last answer). We’re working so that you can build any size of site (millions of pages+) with Gatsby & deploy incremental changes in under 10 seconds.

There are still two remaining valid reasons for run-time SSR that we plan to support. One is personalization where the page needs to be customized for the visitor based on a variety of factors. The other is A/B testing. Both of those require that you can render custom versions of pages on the fly. We will not only support this but also solve it in a way that doesn’t sacrifice the speed and simplicity Gatsby is known for.

## What's a realistic availability timeline for incremental builds using Wordpress with WPGraphQL?

A bit of back history for everyone: last year we hired [Jason Bahl](https://twitter.com/jasonbahl), the creator of [WPGraphQL](https://www.wpgraphql.com/), to continue his work. We want to fully support WordPress + Gatsby, meaning content authors can see real-time previews and content changes deploy in less than 10 seconds. This is the great experience that CMSs provide for content authors. Replicating it is a hard requirement for most people considering moving to a headless WordPress + Gatsby stack.

We choose WPGraphQL as the way forward as Jason’s done an amazing job making incremental querying incredibly fast—as well as adding GraphQL subscription support, which will drive both preview & incremental builds.

Last fall [Tyler Barnes](https://github.com/TylerBarnes) — a long-time Gatsby/WP developer — joined the team to work on a new version of gatsby-source-wordpress that leverages WPGraphQL to drive preview/10 second deploys.

They’ve been making incredible progress. Check out [the umbrella issue for the epic](https://github.com/gatsbyjs/gatsby/issues/19292). A number of people are experimenting with the alphas and even shipping sites! If you’re interested in this space, please dive in.

What’s amazing about this work is that **you’ll soon be able to seamlessly swap out the WordPress presentation layer for Gatsby **without** anyone working in the WordPress CMS noticing**. As a developer, you’ll be able to deliver way faster sites, enjoy far simpler hosting, put WordPress behind a firewall (maybe even skip some of those security updates! 😅🤪), and enjoy all the advantages of working in the world of modern React/JS tooling.

## Working with images is a pain, and the distinction between page and static query seems a wrong API. The [issue #10482](https://github.com/gatsbyjs/gatsby/issues/10482) seems to fix both. What's the plan?

We’ve worked on a number of ideas/prototypes for solving this but haven’t yet arrived at something we feel is a genuine improvement. There are more ideas floating around for better APIs, so stay tuned. We’d love to pair with anyone who has ideas for improving things as well.

## Is there going to be a WP integration with Gatsby Cloud?

Yup! Once the new gatsby-source-wordpress version is ready, Preview & Incremental builds will work out-of-the-box on Gatsby Cloud.

## Are there going to be any big Gatsby core releases coming up?

We ship releases multiple times a week. Most are incremental improvements and bug releases. We periodically write blog posts summarizing improvements. You can catch up with them at [https://www.gatsbyjs.org/blog/tags/gazette/](https://www.gatsbyjs.org/blog/tags/gazette/)

We put up a couple of RFCs recently for “[Recipes](https://github.com/gatsbyjs/gatsby/pull/22610)” and a “[Gatsby Admin](https://github.com/gatsbyjs/gatsby/pull/22713)” experience you can go read. They’re going to push the Gatsby experience forward a lot.

Lots more that we’ll be talking about soon.

## Any plans for gatsby-source-drupal to support some kind of caching when retrieving thousands of nodes from Drupal?

Yup! We hired recently [Shane Thomas](https://www.drupal.org/u/codekarate) to work full-time on improving Drupal + Gatsby to support Preview & Incremental builds just like WordPress and other CMSs.

## Will Gatsby v3 have any breaking changes?

A few, though we don’t anticipate it being a difficult upgrade. We’ve been collecting ideas in this issue (none of them are for sure yet) [https://github.com/gatsbyjs/gatsby/issues/15277](https://github.com/gatsbyjs/gatsby/issues/15277)

## Shadowing pages is difficult. Query collection gets in the way of shadowing pages effectively when using different data sources. Known issue? Being addressed?

Yeah — we’re not satisfied with the shadowing experience yet. One way we’re looking to improve the experience is with Gatsby Admin as you’ll be able to browse your themes and what files they have and immediately shadow one plus see the diff between your shadowed file and the original.

We’re also investigating better patterns for building themes to ensure they’re flexible and straightforward to extend/override.

## Is there a limit on the size of a website generated with Gatsby? At what point does the build time become unmanageable?

That’s a constantly moving target as we improve the Gatsby build process. Our open source team is now 15 people strong and many of them are working on the build process from different angles from improving source plugins to core parts of the build process. [Peter van der Zee](https://twitter.com/kuvos) joined the team as a build performance specialist last fall from Facebook where he was a JS Infrastructure Engineer and [has a long string of PRs improving the build process over the past months](https://github.com/gatsbyjs/gatsby/commits?author=pvdz).

We’re also working on adding benchmark sites that’ll show more clearly when a site is a good fit for Gatsby.

## How do you make awesome documentation? I saw other projects but the documentation of Gatsby has a special place in my heart.

Awww thanks! I don’t know there’s anything magic other than just caring enough to do it. Like doing anything else great — you have to care and put in a lot of effort. The whole community and internal folks leading the effort, like [Marcy Sutton](https://twitter.com/marcysutton) and previously [Shannon Soper](https://twitter.com/shannonb_ux), have done a ton of work to improve the docs over the last few years.

## Is native TypeScript on the roadmap?

Yes! This is something we’re pretty excited about shipping. If you’re interested in learning more or helping out, check out this issue [Sidhartha Chatterjee](https://github.com/sidharthachatterjee) put together — [https://github.com/gatsbyjs/gatsby/issues/18983](https://github.com/gatsbyjs/gatsby/issues/18983)

[Blaine Kasten](https://twitter.com/blainekasten) has also been leading the effort to convert the entire codebase to Typescript which has been a massive effort by dozens of people — [https://github.com/gatsbyjs/gatsby/issues/21995](https://github.com/gatsbyjs/gatsby/issues/21995)

## Are you guys trying to catch up to Next.js's smaller JS bundle size?

A team at Chrome has been doing a lot of investigation into how frameworks like Next.js & Gatsby can optimize how we ship JavaScript. Next.js implemented that a few months ago and last week [Ward Peeters](https://twitter.com/wardpeet) shipped [a PR implementing the same new webpack bundling algorithm](https://github.com/gatsbyjs/gatsby/pull/22253) for Gatsby—so bundle sizes are now identical to Next.js. Very exciting improvement!

## Are you continuing to work on even more good accessibility defaults for Gatsby in the future? How important is accessibility overall within Gatsby?

We care a lot about accessibility. We think that’s part and parcel of building a great framework. We moved to @reach/router as part of Gatsby v2 to take advantage of Ryan Florence’s work on JS router accessibility, and Marcy Sutton has done a lot of testing on how to solve some lingering issues. We hired [Madalyn Rose](https://twitter.com/madalynrose) last fall as a full-time specialist for accessibility engineering in Gatsby.

Check out our blog posts tagged with accessibility: [https://www.gatsbyjs.org/blog/tags/accessibility](https://www.gatsbyjs.org/blog/tags/accessibility)
