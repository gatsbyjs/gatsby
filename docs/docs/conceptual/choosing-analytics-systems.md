---
title: Choosing Analytics Systems
---

Website teams looking to collect insights on user behavior have a wide variety of options.

**Basic Analytics**, which includes [Google Analytics](/plugins/gatsby-plugin-google-analytics/?=google%20analytics), focus on metrics like page views, sessions, bounce rate, entrances and exits, measured on a per-URL basis and tracked over time. They include UTM parameter tracking, in order to tie visitors to specific paid advertising or email campaigns.

Basic analytics tools are often used alongside **Tag Managers** ([Google Tag Manager](/plugins/gatsby-plugin-google-tagmanager/?=google%20tag%20manager)), which can let marketers configure which pages load tracking scripts, or define events when certain elements are clicked.

Google Analytics and Google Tag Manager are the most popular services used on Gatsby sites. But over the last few years, many specialized analytics services have emerged to give deeper insight into visitor behavior.

Gatsby teams have primarily reached for three categories of tools:

**Customer Data Platforms** ([Segment](/plugins/gatsby-plugin-segment-js/?=segment), [Rudderstack](/plugins/gatsby-plugin-rudderstack/?=rudderstack)) are tools that help teams manage and orchestrate multiple analytics systems. This includes centralizing data on visitors.

From an ananlytics perspective, using a CDP allows website teams to replace multiple pixels and trackers with a single tracker, which can significantly improve page performance. (The CDP will ping each service from their systems, rather than the user's browser). CDP includes event replay, so teams can switch marketing tools while preserving historical data.

- Blog post: [How WaveDirect Used Gatsby, Rudderstack, and Sanity to 4X Leads and Dominate Search Results](/blog/how-wavedirect-used-gatsby-rudderstack-and-sanity-to-4x-leads-and-dominate-search-results/)

**Product analytics tools** ([Heap](/plugins/gatsby-plugin-heap/?=gatsby-plugin-heap), [Amplitude](/plugins/gatsby-plugin-amplitude-analytics/?=gatsby-plugin-amplitude), [Mixpanel](/plugins/gatsby-plugin-mixpanel/?=gatsby-plugin-mixpanel)) are aimed at giving more granular ways to segment users, measure the rate at which they performed specific actions, and compare groups of users to each other. They can also include advanced analyses, like cohort retention charts. Some (Heap) will auto-track all events, while others (Mixpanel, Amplitude) require users to define and trigger relevant events in code.

Product analytics tools produce quantitative data -- charts, graphs, and tables -- and are primarily used by demand generation teams to optimize user purchase and conversion rates.

- Blog post: [Jaxxon: Gatsby + Shopify = Faster Growth](/blog/jaxxon-gatsby-shopify-faster-growth)

**Session recording tools** ([FullStory](/plugins/gatsby-plugin-hotjar/?=fulls), [Hotjar](/plugins/gatsby-plugin-hotjar/?=gatsby-plugin-hot)) include heatmaps visualizing where users tended to click, and scrollmaps showing engagement drop-offs on landing pages. They overlay users' actions on page screenshots, and let teams track individual visitors' journey through your website.

Session recording tools collect individualized, qualitative data and tend to be used by designers and UX researchers iterating on page design, layout and copy. In addition, session recordings are often cross-referenced by support teams from their ticketing and chat systems while they are communicating with customers.
