---
title: Performance improvements for large sites
date: 2019-06-12
author: Anthony Marcar
tags:
  - application performance
  - architecture
  - performance
---

Gatsby has always focused on performance. It takes all the best practices you read about on the internet, and gives them to you for free when you build your site in Gatsby. However, if you have a large site, e.g > 5000 pages, you may have noticed that the UI performance degrades as more pages are added. Clicking links can feel sluggish compared to the instantaneous page changes that occur on smaller Gatsby sites.

Over the past few months, I've been gradually changing Gatsby's architecture so that the size of the site has absolutely no impact on UI performance. And [it's finally merged](https://github.com/gatsbyjs/gatsby/pull/14359#event-2402986461)! From gatsby [v2.9.0](https://www.npmjs.com/package/gatsby/v/2.9.0) onwards, you should notice performance gains on larger sites.

Read on for some background on what was causing the slowdown, and how we fixed it (warning, this gets into the technical guts of Gatsby).

# Symptoms

There were two main symptoms experienced by users of large Gatsby sites.

1. After navigating to a Gatsby site, it took a while for all the javascript to load so that it was "interactive". Therefore, clicks immediately after loading the page could take many seconds to actually navigate.
1. Even after the initial load, clicking links was laggy, even though all the target page's resources were already prefetched.

# The Problem: Global pages manifest

The core problem was that Gatsby generates a file for each build called `pages-manifest.json` (also called `data.json`) that must be loaded by the browser before users can click through to other pages. It contains metadata about every page on the site, including:

- **componentChunkName**: The logical name of the React component for the page
- **dataPath**: The path to the file that contains the page's graphql query result, and any other page context.

When a user clicks a link to another page, Gatsby first looks up the manifest for the page's component and query result file, downloads them (if they haven't already been prefetched), and then passes the loaded query results to the page's component and renders it. Since `pages-manifest` contains the list of all pages on the site, then Gatsby can immediately show a 404 if necessary.

This works great for small sites, but the more pages, the bigger the manifest gets. And the bigger the manifest gets, the more data the browser has to download before any UI navigation can occur.

Even after the manifest had been loaded, the manifest had to be searched for the matching path. Which was necessary since pages can be declared with a [matchPath](https://www.gatsbyjs.org/docs/gatsby-internals-terminology/#matchpath) (regex path). So huge manifest files resulted in perceptable lag when clicking links too.

# Solution: No more pages manifest!

The solution of course was to introduce a manifest file per page, instead of a global pages-manifest. We called this `page-data.json`. And it included:

- **componentChunkName**: The logical name of the React component for the page
- **result**: The full graphql query result and page context
- **webpackCompilationHash**: Unique hash output by webpack any time any site src code changes

This is very similar to each entry in the pages manifest. The major difference being that the graphql query result is inlined instead of being contained in a separate file.

Now, when a page navigation occurs, Gatsby makes a request directly to the server for the `page-data.json`, instead of checking the global manifest (which doesn't exist anymore).

## But, don't we have to wait on a network request on each navigation now?

Prefetching FTW! Gatsby already prefetches any links on the page so that when the browser needs them, they're already in the cache. So when Gatsby makes a request for the `page-data.json`, it's already in the browser (assuming the user has been on the page long enough for the prefetches to finish).

# Other benefits

## Gatsby sites are now more "live"

In Gatsby, all resources are content-hashed (except the html files). This includes the pages-manifest. So once a Gatsby site is loaded in the browser, the user will only ever see the resources generated during that build. If they stay on the site for days, they'll never see new content until they refresh.

The new `page-data.json` resources are **not** content-hashed. Which means if a user is on the site, and a rebuild occurs resulting in changed `page-data.json`, then the user will see that new information when they navigate to that page.

But, this is only true if a page hasn't already been prefetched. We have some ideas for periodically expiring prefetched data to ensure that new changes are visible to users. Stay tuned.

## Netlify builds faster

The old graphql static query results were content-hashed. Which meant that any change to any data resulted in a change to the pages-manifest. Hosting sites such as Netlify look at the changed files and use that to figure out what files can be shared between builds. Since the pages-manifest depends on all query result files, which are all content-hashed, then any data change resulted in a change to the pages-manifest, which could be 10+ MB in size.

With the latest changes, if you only make a change one page's data, then Netlify will only have to copy that file when it rebuilds.

## First step towards incremental builds

Gatsby has been talking about incremental builds [since day 1](https://www.gatsbyjs.org/blog/2018-05-24-launching-new-gatsby-company/#rebuild-gatsby-on-a-stream-processing-architecture-to-eliminate-the-build-step). The pages-manifest was a global list of all pages that was tied to webpack. So any change to any page data resulted in a full webpack rebuild. This is no longer the case, which should make building incremental Gatsby much easier.

# Backwards compatible

To use these changes, simply update to the latest version of Gatsby. All changes are 100% backwards compatible.
