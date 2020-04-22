---
title: Performance improvements for large sites
date: 2019-06-12
author: Anthony Marcar
tags:
  - performance
  - large-sites
---

Gatsby has always been, and will always be, focused on performance. All of the best practices and patterns relating to performance are internalized and we enable these performance optimizations _by default_ for every Gatsby application. However, there is always more we can do and we are always striving to make incremental improvements that impact _every_ Gatsby user. From this basis, we're happy to announce a new performance improvement: splitting the page manifest into individual files for each page. Prior to this change, for large Gatsby applications (e.g. more than 5,000 pages), the page manifest could grow to 200Kb or more, and loading this manifest could take several seconds on 3g connections, which is certainly non-ideal!

Over the past few months, I've been gradually changing Gatsby's architecture so that the size of the site has absolutely no impact on real-world performance. This change [has been merged](https://github.com/gatsbyjs/gatsby/pull/14359#event-2402986461) and is available, for free, in [Gatsby v2.9.0](https://www.npmjs.com/package/gatsby/v/2.9.0). From this point forward, your application manifest will no longer grow proportionally to the number of pages in your Gatsby application.

In this post, I'll dive deep into the technical intricacies of what was actually causing this slow down and how we fixed the growing page manifest problem.

## Symptoms

There were two main symptoms experienced by users of large Gatsby sites.

1. After navigating to a Gatsby site, it took a while for all the JavaScript to load so that it was "interactive". Therefore, clicks immediately after loading the page could take many seconds to actually navigate.
1. Even after the initial load, clicking links could be somewhat laggy even though the target's resources had already been pre-fetched.

## The Problem: Global pages manifest

The central problem was that Gatsby generates a file for each build called `pages-manifest.json` (also called `data.json`) that must be loaded by the browser before users can navigate to other pages. It contains metadata about every page on the site, including:

- **componentChunkName**: The logical name of the React component for the page
- **dataPath**: The path to the file that contains the page's graphql query result, and any other page context.

When a user clicks a link to another page, Gatsby first looks up the manifest for the page's component and query result file. Gatsby then downloads them (if they haven't already been prefetched), and then passes the loaded query results to the page's component and renders it. Since `pages-manifest` contains the list of all pages on the site, Gatsby can also immediately show a 404 if necessary if the page is not able to be located.

This works great for small sites, but as a Gatsby application grows, so too does the size of the page manifest. The bigger the manifest gets the more data the browser has to download before any UI navigation can occur leading to slowdowns in important metrics like Time to Interactive (TTI).

Even after the manifest had been loaded, the manifest had to be searched for the matching path. This was necessary since pages can be declared with a [matchPath](https://www.gatsbyjs.org/docs/gatsby-internals-terminology/#matchpath) (a Regular Expression used to match client-only paths). Huge manifest files resulted in perceptable lag when clicking links too!

## Solution: Eliminate the monolithic pages manifest!

The solution seems abundantly obvious at this point. We needed to introduce a manifest file per page, instead of a global pages-manifest. We called this `page-data.json`. It includes:

- **componentChunkName**: The logical name of the React component for the page
- **result**: The full graphql query result and page context
- **webpackCompilationHash**: Unique hash output by webpack any time user's `src` code content changes

This is very similar to each entry in the pages manifest. The major difference being that the graphql query result is inlined instead of being contained in a separate file.

Now, when a page navigation occurs, Gatsby makes a request directly to the server for the `page-data.json`, instead of checking the global manifest (which doesn't exist anymore).

Below is a [webpagetest.org](https://www.webpagetest.org/) comparison of [gatsbyjs.org](https://www.gatsbyjs.org/) (which has about 2,500 pages) [before](https://www.webpagetest.org/result/190530_4Y_26c37e9fa44cdeef1617d2861ee6927e/) and [after](https://www.webpagetest.org/result/190530_7J_5f0c238b0658ed9de9aa7ed30b5538e6/) the change. As you can see, the _First Interactive_ has been reduced by 432% (5.011 seconds saved), and almost all other metrics have improved as well.

<figure>
  <img alt="Webpagetest.org performance comparison" src="./comparison.png" />
  <figcaption>
    Webpagetest.org Comparison of Gatsbyjs.org before and after v2.9.0
  </figcaption>
</figure>

### Don't we have to wait on a network request on each navigation now?

Prefetching FTW! Gatsby already prefetches any links on the page so that when the browser needs them, they're already in the cache. So when Gatsby makes a request for the `page-data.json`, it's already in the browser (assuming the user has been on the page long enough for the prefetches to finish). You can read more about this prefetching behavior in this blog [deep dive on Gatsby's performance optimizations](/blog/2019-04-02-behind-the-scenes-what-makes-gatsby-great/#gatsby-link-and-link-relprefetch).

## Other benefits

### Gatsby sites are now more "live"

Previously in Gatsby, all resources are content-hashed (except the html files). This includes the pages-manifest. So once a Gatsby site is loaded in the browser, the user will only ever see the resources generated during that build. If they stay on the site for days, they'll never see new content until they refresh.

The new `page-data.json` resources are **not** content-hashed. This means that if a user is on the site and a rebuild occurs resulting in changed `page-data.json`, the user will then see that new information when they navigate to that page.

However, this is only true if a page hasn't already been prefetched. We have some ideas for periodically expiring prefetched data to ensure that new changes are visible to users. Stay tuned for more on this front!

### Netlify builds faster

The old graphql static query results were content-hashed. Which meant that any change to any data resulted in a change to the pages-manifest. Hosting sites such as Netlify look at the changed files and use that to figure out what files can be shared between builds. Since the pages-manifest depends on all query result files, which are all content-hashed, then any data change resulted in a change to the pages-manifest, which could be 10+ MB in size.

With the latest changes, if you only make a change one page's data, then Netlify will only have to copy that file when it rebuilds.

### First step towards incremental builds

Gatsby has been talking about incremental builds [since day one](/blog/2018-05-24-launching-new-gatsby-company/#rebuild-gatsby-on-a-stream-processing-architecture-to-eliminate-the-build-step). The pages-manifest was a global list of all pages that was tied to webpack. So any change to any page data resulted in a full webpack rebuild. This directly opens up the opportunity to deliver a feature like incremental builds, and we can't wait to do just that.

## Backwards compatible

To use these changes, simply update to the latest version of Gatsby. All changes are 100% backwards compatible. One of the key values of using Gatsby and keeping up-to-date is that we are regularly making these incremental improvements that you can deliver to your users just by upgrading your version of Gatsby. Upgrade to Gatsby v2.9.x today--and keep those Gatsby applications blazing fast 🔥!
