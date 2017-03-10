---
title: What is a static site
---

# What is Gatsby

- Static site generator
- Generates react web apps
- Performance is #1

## Gatsby's goal:

  ... for kyle to write


# What is a static site?

There is often confusion around what is meant by a static site and how this is different from a "web app". The word "static" in this case does refer to the user experience, but rather to how the site is served. With a static site, the HTML for every possible route (or url) is generated *at build time*, whereas for non-static sites, the HTML is generated fresh every time it is requested aka. at *run-time*, either on the server ("server-rendered") or on the client ("client-rendered").

Gatsby is built with React, and every possible route is generated at build time, so when a visitor requests `www.gatsbygram.netlify.com/`, they are sent the `index.html` file. This file contains all the markup for the homepage, and will also pull in all of the javascript needed to run the site on the client for all subsequent routing.

## Why make a site static?

There is a massive performance benefit from making a website static. HTML is generated ahead of time and served immediately upon request. In a server-rendered app, latency is incurred waiting for the server to generate markup, and on a client-rendered app there is an even longer delay while the client downloads javascript and then renders the app and requests any data it needs.

## Why aren't all websites static?

Any site or web app could be a static site, but generating HTML ahead of time is only feasible for certain types of websites. To see why, think about if Facebook tried to generate HTML for every possible route ahead of time... they would have thousands of pages to generate for every one of their billions of users - and then they would have to re-generate each page every time something changes! It's simply not feasible, so they generate HTML at the moment it is requested.

Generally, content-based sites where every visitor to a page sees the same thing are the ideal use case for static sites. With Gatsby, however, not *every* route needs to be completely static. We give you the flexibility to render some pages statically ahead of time and keep others as client-rendered dynamic pages. The New York Times, for example, might make all of their articles static, but keep the "account" page dynamic, since it differs for every user.
