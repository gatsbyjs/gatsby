---
title: "Gatsby Gazette: The August Edition"
date: 2019-08-07
author: Sidhartha Chatterjee
excerpt: "Welcome to the new and improved Gatsby Gazette"
tags:
  - gazette
---

Remember when I said I'll see you folks next week with a jam packed Gazette? It's been 3 months! 😱 If it's any consolation though, this one _is_ a jam packed edition.

Welcome to the _new_ and _improved_ Gatsby Gazette. It's been a while. We have a lot to talk about.

This edition features our work on making Gatsby more stable, the Themes Jam, some solid documentation improvements, exciting livestreams featuring Jason _Blitz_ Lengstorf, highlights from the community and the revamped Core Maintainers meeting.

Moving forward, we'll be posting these on a monthly cadence wrapping up all the latest and greatest news in Gatsby-land!

## Team Highlights

### Snow Leopard Release

The past few weeks has been all about what we're calling the Snow Leopard release (kudos to [Dustin](https://twitter.com/schaudustin) for the idea and name).

First, an aside.

[Snow Leopard](https://en.wikipedia.org/wiki/Mac_OS_X_Snow_Leopard) was the seventh major release of macOS. Unlike those of previous versions, the goals of Snow Leopard were improved performance, greater efficiency and the reduction of its overall memory footprint. Addition of new end user features was not a primary consideration: its name signified its goal to be a refinement of the previous OS X version, Leopard.

Similarly, earlier last month, we felt like we needed to take some time to slow down and clean up Gatsby after some of the big features that we've shipped recently: notably ([themes](https://www.gatsbyjs.org/blog/2019-07-03-announcing-stable-release-gatsby-themes/) and [per page manifest](https://www.gatsbyjs.org/blog/2019-06-12-performance-improvements-for-large-sites/)). Our goal was to take a step back, move a bit more slowly, and improve the overall code base, add tests, and overall ensure our house is in good order for more improvements in the future.

We feel this went quite well, so we intend to keep doing this fairly regularly to keep Gatsby stable and ensure you have painless upgrades. Our goal is to always enable the experience [Brian Holt](https://twitter.com/holtbt) depicts below, specifically painless upgrades and all the while delivering real value and fixes in every version of Gatsby.

https://twitter.com/holtbt/status/1158559782451609600

Check out the [project](https://github.com/gatsbyjs/gatsby/projects/13) on GitHub if you're interested.

### WPGraphQL for Advanced Custom Fields

[WPGraphQL for Advanced Custom Fields](https://www.wpgraphql.com/acf) is a WordPress plugin that enables you to use [`gatsby-source-graphql`](https://www.gatsbyjs.org/packages/gatsby-source-graphql/) for your complex WordPress sites that use the hugely popular [Advanced Custom Fields](https://www.advancedcustomfields.com/) plugin.

The author of WPGraphQL, [Jason Bahl](https://twitter.com/jasonbahl) recently joined our team and open sourced WPGraphQL for Advanced Custom Fields which was previously a paid plugin.

Open sourcing this is a step forward in our commitment to making Gatsby + WordPress even more seamless and we're excited for you to try it out. You can find it on GitHub at [github.com/wp-graphql/wp-graphql-acf](https://github.com/wp-graphql/wp-graphql-acf).

### Learning

Our team has been hard at work on improving the documentation on [gatsbyjs.org](https://gatsbyjs.org). Amongst many _many_ other things, we've added:

- Next and previous pagination links to guide users through the documentation
- A floating Table of Contents

[Marcy](https://twitter.com/marcysutton) also taught a workshop at Frontend Masters and this is a must watch for all of us to learn how to build accessible applications on the web.

Accessibility is very important to us and this is one of many steps we're taking in helping make the web more accessible. Check out the workshop at [frontendmasters.com/workshops/javascript-accessibility](https://frontendmasters.com/workshops/javascript-accessibility/).

### Copy Button for Code Snippets

[Dustin](https://twitter.com/schaudustin) noticed at a workshop recently that people tend to highlight the wrong lines, or lose a few lines when highlighting a code snippet to copy leading to strange errors and confusion.

He decided to improve this and _did_ by adding a beautiful and accessible Copy button to all code snippets in our documentation! Here is what it looks like:

![Copy Button GIF](./copy-button.gif)

If you're curious about the implementation, [here](https://github.com/gatsbyjs/gatsby/pull/15834) is a link to the PR.

### Native Lazy Loading

[Native Lazy Loading](https://web.dev/native-lazy-loading) just launched in Chrome 76. We shipped support for this in `gatsby-image` back in May! So if you're using Gatsby, your site already does this out of the box.

https://twitter.com/chatsidhartha/status/1129118956193640448

Check out the implementation on the [PR on GitHub](https://github.com/gatsbyjs/gatsby/pull/13217).

### Jason _Blitz_ Lengstorf

Jason has basically been living his life on livestream since the past month. He's done some incredible streams and has many more exciting ones coming up.

My favourite of the past few ones was [Advanced GraphQL techniques in Gatsby](https://www.twitch.tv/videos/462874512) with [Mikhail Novikov](https://twitter.com/freiksenet).

In case that isn't your jam, there's also [Gatsby + WordPress](https://www.youtube.com/watch?v=DH7I1xRrbxs), [building an RSS feed-powered podcast site](https://www.youtube.com/watch?v=0hGlvyuQiKQ), [composing and styling Gatsby themes](https://www.youtube.com/watch?v=6Z4p-qjnKCQ), [Microfrontends](https://www.youtube.com/watch?v=0Ta-awtLZTs) and even a [livestream on livestreaming](https://www.youtube.com/watch?v=rgTugjTDYaE)! How _meta_!

Here's a convenient [playlist](https://www.youtube.com/playlist?list=PLz8Iz-Fnk_eTpvd49Sa77NiF8Uqq5Iykx) if you want to binge watch these.

### Theme Jam

Talking about jam, to celebrate the launch of Gatsby Themes, we announced the [Gatsby Theme Jam](https://themejam.gatsbyjs.org/) last month.

The response was incredible. Seeing so many wonderful themes from all of you has been spectacular and we're afraid we might like _too_ many of them to pick one.

The team is currently hard at work judging and picking their favourites so results should be out very soon!

## Community Highlights

Firstly, thank you for all your contributions, folks! Every single contribution to Gatsby makes it better and every single contribution _matters_. Some of the community highlights from the last month include:

- [Benjamin Lannon](https://github.com/lannonbr) [built a Table of Contents component](https://github.com/gatsbyjs/gatsby/pull/15251) that is live on our documentation and is great when reading a lengthy documentation page
- [Kelly Vaughn](https://github.com/kellyvaughn) [added support for metafields to product nodes](https://github.com/gatsbyjs/gatsby/pull/16312) in `gatsby-source-shopify`
- [Asko Soukka](https://github.com/datakurre) added a great [fix to ensure touchNode](https://github.com/gatsbyjs/gatsby/pull/15919) populates typeOwners
- [Grant Glidewell](https://github.com/grantglidewell) added [support](https://github.com/gatsbyjs/gatsby/pull/14630) for Gatsby [Preview](https://www.gatsbyjs.com/preview) for Drupal in `gatsby-source-drupal`
- [Ellis Kenyő](https://github.com/elken) added [support for the Prism command-line](https://github.com/gatsbyjs/gatsby/pull/16170) plugin in `gatsby-remark-prismjs`
- [Anthony Powell](https://github.com/cephalization) added a [great error check](https://github.com/gatsbyjs/gatsby/pull/16272) in Gatsby

Gatsby has always been a community effort. You make a _lot_ of contributions. In fact, we achieved a new record in merged PRs last month:

https://twitter.com/chatsidhartha/status/1156334013247737856

## Gatsby Site of the month

Time to show off some great stuff people have been building.

The Gatsby site of the month is [fourpost.com](https://www.fourpost.com)

We love it because:

- Wonderful image loading
- The illustrations are so very pretty
- Uses [Gatsby Preview](https://www.gatsbyjs.com/preview)
- Pulls in content from multiple data sources: DatoCMS & EventBrite

## Community Maintainers Meeting

The Core Maintainers Meeting is now the **Community** Maintainers Meeting.

We've renamed the meeting to emphasize that this time is for the community. You can join the meeting whether you've contributed to Gatsby, use it regularly, or are just trying it out for the first time. Everyone is welcome!

We've also restructured the meeting with a new format that includes:

- time for questions
- time for updates
- live pull request reviews

Live pull request reviews are a great way to involve the community in growing understanding of the PR process _and_ to also get user-impactful PRs merged! We hope these give you some insight into how we review contributions and help make [your first contribution](http://gatsby.dev/pair-programming) as smooth as possible.

In case you're not comfortable asking questions on the call (a video call with strangers can be intimidating, we understand), we have a form to submit questions/pull requests for live review. The form is at [gatsby.dev/oss-maintainers-form](https://gatsby.dev/oss-maintainers-form).

Here's a nifty [add to calendar link](http://gatsby.dev/oss-maintainers) for the meeting.

Join us on the meeting every Wednesday at 8:30 AM (PDT) 🙌

## We're hiring

Like what you see and want to help us build Gatsby? We're now hiring engineers on both the Open Source and Cloud teams.

Check out the open roles at [gatsbyjs.com/careers](https://www.gatsbyjs.com/careers/)

We can't wait to work with you 💜
