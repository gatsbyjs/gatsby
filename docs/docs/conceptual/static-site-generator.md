---
title: Static Site Generator
---

Static-site generation is the default rendering method in the Gatsby Framework. While the word has static in it, it doesn't at all mean boring or lifeless. It simply means the entire site is generated into bite-sized, pre-rendered HTML, CSS, and Javascript and served as a static-asset to the browser. Because all of that HTML, CSS, and JS is preprocessed and rendered at build-time, Static-Site Generation serves websites to users in the fastest possible way - it's ready to go before the visitor even visits the site. 

Static site generators are an alternative to database-driven content management systems, such as WordPress and Drupal. In such systems, content is managed and stored in a database. When the server receives a request for a particular URL, a software layer retrieves data from the database, merges it with template files, and generates an HTML page as its response.

You can also use static site generators to create [JAMStack](/docs/glossary/#jamstack) sites. JAMStack is a modern website architecture that uses JavaScript, content APIs, and markup. Gatsby, for example, can use the [WordPress REST API](/docs/how-to/sourcing-data/sourcing-from-wordpress/) as a data source.

## How It Works
With Static Site Generation, a website is built before run-time. Meaning the entire site is pre-processed and deployed to a content delivery network, before a visitor visits the site.

![Alt](../images/ssg-diagram.png)

### Site Visitors
When a visitor first visits the page, the entire site is already built as an almost immutable object and loaded into the browser. This first load happens incredibly fast since it's served from a CDN that is physically closer to the site visitor than traditional web servers.
When a visitor clicks a link, the next page is already built and rendered in the browser - so there is not a millisecond of lag.

### Developers & Content Creators
When a developer or a content creator makes a change to a website, the entire website has to be built and deployed to the CDN before a site visitor can be seen.

## Benefits of Static-Site Generation

### Faster Site Performance
Since the site has been pre-built and delivered on an edge network, meaning visitors get an insanely fast, responsive experience. Faster Site performance also means higher Lighthouse scores which should increase organic traffic sent from Google.

- *Pre-Built:* There is little no lag time when clicking links and navigating to new pages.
- *Edge Network:* Edge networks are content delivery networks that serve up web pages from a POP (point of presence) physically closer to the site visitor than traditional web visitors.

### Better Security
Most websites are hacked by manipulating a database through actions taken on the frontend of a website. Static-sites reduce the likelihood of a hack since they have no active connection to a database.

### Scalability
Static-sites scale much better than traditional sites using web-servers since they are cached and delivered on CDNs, not needing to add more server power to vertically scale a monolithic website.

### Lower Costs
Static-sites are optimized and packaged to deploy the smallest footprint possible, served and cached on Content Delivery Networks, thus reducing the overall cost to run. There is no active web server that is constantly running, costing you dollars while visitors aren't there.

## Cons of Static-Site Generation
### Slower Build Times
Static-Site Generation can often result in slower build times, since all the pages are created and pre-rendered at build time. When a change is made to a site, normally the entire site has to be rebuilt. With Gatsby Cloud and Incremental Builds though, this challenge has largely been solved.
