---
title: "How Gatsby can power your site offline - even without JavaScript"
date: 2019-11-05
author: David Bailey
excerpt: "With Gatsby's offline plugin, network troubles are a thing of the past."
tags:
  - plugins
  - performance
  - accessibility
---

You know the feeling: you saw a cool website or read an interesting article the other day, and you'd like to check back on it, or maybe you’re with some people that you’d like to share it with. But what’s this? You don’t have any phone signal, and the wi-fi connection is spotty at best – if there is one at all! You attempt to open the page, but try as you might, the loading spinner just keeps on spinning...

With `gatsby-plugin-offline`, that's a thing of the past. Install the plugin in an existing Gatsby site using npm or Yarn, add it to your `gatsby-config.js`, and your site will instantly gain offline support without any additional configuration needed. (Read full instructions on how to [add offline support with a service worker
](/docs/add-offline-support-with-a-service-worker/).) Now, whenever someone visits a page on your site, that page will be available later without an internet connection, along with any other pages which have been preloaded in the background.

Recently `gatsby-plugin-offline` version 3 was released, adding some exciting new features such as the ability to pre-cache a customized set of pages. It also introduced some under-the-hood changes, the most notable being a major version upgrade of [Workbox](https://developers.google.com/web/tools/workbox), the library which powers the core functionality of `gatsby-plugin-offline`. However, arguably the most interesting change is that the plugin will now keep working even if you disable JavaScript on a website which uses it.

How does this work? Service workers and page-level JavaScript run in different contexts and don't have direct access to each other's context, although they can communicate with each other using a built-in message API - or even via data contained within a request, since requests can be intercepted by the service worker. More on that point later.

`gatsby-plugin-offline` has a wrapper API which makes use of the message API, enabling the page-level JavaScript to transfer data to/from the service worker - for example, this can be used to specify which JavaScript and CSS resources are essential for a particular page. Its service worker also serves a lightweight "offline shell" for pages which are available from the cache (determined by checking for each of the essential resources) instead of the full pre-rendered HTML.

When you (or someone accessing your website) disable JavaScript for a particular domain, contrary to what you might expect, any service workers installed on that domain keep running. This means the plugin will continue to intercept page requests and serve a shallow offline shell if it determines that all the resources are available - even though JavaScript is required to display the content of the page in this case (since the offline shell doesn't contain pre-rendered HTML).

With `gatsby-plugin-offline` version 3, this is no longer the case. When the plugin detects that JavaScript is disabled, it automatically disables the offline shell and switches to full pre-rendered HTML, allowing the site to function again! This is a huge advantage for accessibility, since it allows people to toggle scripts even after they've initially visited a site, without causing it to stop working.

So, how does the service worker detect that JS is disabled, given that the client can't use JS to communicate this to the worker? Back to an earlier point: we can also communicate to the service worker using data contained within a request, such as its URL. So, if we request a specially formatted URL, and "catch" this request from within the service worker, we can tell it that JS is disabled.

How does this work in practice? Firstly, the service worker keeps track of which page was requested last. Within the offline shell, we include a `noscript` tag in the head, inside which is a `meta` tag that specifies an immediate redirect to the URL `/.gatsby-plugin-offline:api=disableOfflineShell&redirect=true`. The service worker then "catches" this request, disables the offline shell, and then sends a `Location` header in its response which sends the browser back to the initially requested page.

If you want to try out this feature for yourself, [add the latest `gatsby-plugin-offline` to an existing site](/docs/add-offline-support-with-a-service-worker/), or use the [Gatsby CLI](/docs/gatsby-cli) to run `gatsby new my-blog gatsby-starter-blog` and create a new site which includes the plugin out-of-the-box. Find any problems? [Let us know!](/contributing/how-to-file-an-issue/)
