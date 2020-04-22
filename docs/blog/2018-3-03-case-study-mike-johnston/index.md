---
title: "Case Study: Mike Johnston for Colorado"
date: 2018-03-03
author: Brandon Konkle
image: mike-johnston-homepage.png
tags: ["wordpress", "netlify", "security", "case-studies"]
---

### How we used React, Headless WordPress, GraphQL & Gatsby to build Mike’s new online platform

[Ecliptic](http://www.ecliptic.io) is a small development team out of Broomfield, Colorado. We build everything from high-performance content-driven sites to richly interactive web and mobile applications using React, GraphQL, and functional programming. [Mike Johnston](https://www.mikejohnstonforcolorado.com) is a Colorado gubernatorial candidate with an ambitious vision. When we heard about his ideas for an online platform to truly engage with his constituents and give them a real voice, we were excited about the opportunity to make his ideas into reality!

While we’re still a few phases away from seeing Mike’s ultimate vision come to fruition, we’ve got the foundations in place and we’re putting the finishing touches on a gorgeous new interface for Mike’s homepage. Check it out at [https://www.mikejohnstonforcolorado.com](https://www.mikejohnstonforcolorado.com)!

## Laying the Foundation for an Extensible Future

Our goal was to provide a solid architecture to build a long-term future on top of. In later phases the site will become a full-fledged web application with an organizing and fundraising platform built-in, and the goal beyond that is to create an innovative “open source policy” platform to involve citizens in the policy-making process like never before!

To execute on this effectively, we prioritized a few architectural goals:

- **System Resources** — Sadly, public sector software budgets often don’t match those of their private sector counterparts. We wanted to pursue a system that would not require a large deployment, a lot of performance tuning, and constant monitoring and maintenance.
- **Security** — It’s no secret that there are bad actors across the world that would love to influence campaigns and governance wherever they can. We wanted to provide strong protections to prevent hackers from gaining access and interfering.
- **Maintainability** — If this stack is going to support a growing engagement and policy platform on a lean budget, it needs to be easy to work on. We wanted to maintain best practices wherever possible and use techniques that would be easy for someone to come in behind me and build on.

## Content Management with WordPress

The first decision we made was to use the ubiquitous [WordPress](http://wordpress.org) CMS to manage dynamic homepage content. WordPress has a lot of rough edges, but if you can work around them it provides an excellent admin with rich content editing. It’s also very widely used, so there’s a good chance that team members have had experience with it previously.

The downside is that WordPress is implemented with [PHP](http://www.php.net/), and it takes some effort to host and maintain it in an efficient way. As traffic grows, so does system load. When a site achieves great success, it also is introduced to a host of new performance problems caused by heavy traffic. Caching and query optimization can mitigate this greatly, but it takes a lot of time and effort to configure and maintain. In addition, it can be challenging to use modern frontend tools like React to their full potential.

In addition, because WordPress is so broadly adopted it is often the subject of a lot of hacking effort. As exploits are discovered, they can be widely utilized because of the number of targets available.

To work around these issues, we decided to go with a “headless” WordPress instance that only functions as an admin interface. Using tools like [Advanced Custom Fields](https://www.advancedcustomfields.com/) and the [Custom Post Type UI](https://wordpress.org/plugins/custom-post-type-ui/), we created a very flexible repository for homepage content that is then available via the [REST API](https://developer.wordpress.org/rest-api/). This frees us up to use whatever frontend tools are the best for the job, and adds a layer of separation from WordPress’s performance and security challenges.

## Static Site Generation with Gatsby

Since we had complete freedom on the frontend, we wanted to pursue a solution based on [React](https://reactjs.org/), our framework of choice in the browser. We’ve used [Server Side Rendering](https://reactjs.org/docs/react-dom-server.html) solutions in the past based on [Node](https://nodejs.org/en/) and [Express](https://expressjs.com/), but over time they run into some of the same performance issues that PHP does. Server load is always a significant issue on dynamically rendered high-traffic applications, because they typically need to interact with a variety of other systems to construct each page. As concurrent requests grow, so does response time.

One way to sidestep a great deal of these concerns is to make use of as much static content as possible. Static content is astonishingly light on system resources to serve up even at higher traffic levels, and it can be propagated to worldwide [Content Delivery Networks](https://en.wikipedia.org/wiki/Content_delivery_network) and served up to local users at lightning speeds. Static content traditionally has two big problems, however. It’s not trivial for non-technical users to update with frequently changing content, and it’s typically not very interactive or responsive.

[Gatsby](/) is a project that has grown quickly into a best-of-both-worlds solution that is able to weave static file generation into a cohesive browser-based application complete with preloaded client-side routing to each static page. After the initial page load, Gatsby ensures that the browser begins fetching each additional page that is linked to ahead of time. When the user clicks a link, the browser doesn’t need to make an additional round-trip request to the server to get the next page. The experience of navigating around the site is noticeably faster than traditional page loads, and Gatsby provides a plugin to ensure that Google Analytics actions are still triggered for each routing event.

## WordPress Integration with Triggered Builds

To connect with the content, we used Gatsby’s supported WordPress REST API plugin. This uses WordPress’s API discovery to identify all available endpoints, and then retrieves all content available from each one. It then makes the data available in its own [GraphQL](https://graphql.org/) schema, which it uses to power the build system API. This ends up being a novel and quite effective way to make it easy for frontend developers to integrate with the data generated by the build system. Using a guided graphical query system, developers can discover the data available to them and test out different ways of querying and mutating it before they ever use it in their React components.

Using the custom fields and post types, we built out a structure for managing content in a variety of different places on the site using the WordPress admin. Media is made available via the REST API, and Gatsby downloads each file used in the build locally so that it can apply image processing and responsive sizing. Using small custom scripts in the Gatsby project root, developers can turn WordPress content into GraphQL data that they can use anywhere on a page.

The gotcha to all of this outstanding developer experience and astonishing client-side performance is that it is still not as easy as I’d like to update content. Each time content is updated on the headless WordPress instance, a custom PHP script triggers a build on our hosting platform. The build and deploy process currently takes about 5 minutes each time to run, so new content doesn’t show up right away. We have plans to optimize this in a variety of ways, but this is the current state.

Our build process has been relatively fragile as we’ve worked around inconsistencies in the WordPress API and minor issues with the Gatsby plugin to interact with it. We expect this to stabilize over time as we identify issues and workarounds with real production use, however. The static site structure has been very helpful for resilience. The build may break and prevent new content from showing up, but it’s much less likely that an issue would actually bring the site down like it would in a dynamic application environment.

## Obscurity isn’t Security, but it Helps

The static site structure provides a layer of separation that makes potential attacks less damaging. If an attacker gains access to the machine containing the static content, they won’t discover anything that isn’t already publicly available. They can alter the content shown temporarily, but this can be solved in minutes with a new build and a new static server with fresh credentials. With some care, there should be little evidence leading back to the headless WordPress server managing content and administrator accounts.

This is not an excuse for half-hearted security precautions or maintenance, however. It is still essential to keep your WordPress installation up to date and regularly audit server security. A skilled hacker often has a variety of different attack vectors they can use to gain pieces of information about your architecture — not all of them based on technology. Assume that your admin will be discovered, and take appropriate measures to keep data safe.

Using tools like [CORS](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS) headers, encrypted auth tokens, and secure connections you can still connect to remote APIs with strong protections for your users, systems, and data.

## The Trail Ahead

The WordPress solution is excellent for managing dynamic editorial content, but as we build out more interactive features we need to begin interacting with an API to show content that changes depending on the logged in user, or user-generated content. We could interact with the WordPress API directly, but that works against the aforementioned security and performance benefits of using a headless instance and a static build.

Instead, we decided to go with an [Apollo](https://www.apollographql.com/) GraphQL server so that we could interact with the API server the same way we were interacting with the Gatsby content system. Using standard Express middleware and Apollo tools, we were able to quickly define a schema that both my server and client code can programmatically understand and help type-check during development. It’s working quite well to help us quickly build out interfaces with minimal data issues.

Security and performance will obviously become greater concerns as the interactive application is built out, but we have more time to deal with that while the homepage is already up and running and serving up dynamic content with the performance of static files.

## Let's Chat!

Have questions about the setup and future plans, or comments about our approach? We're launching a branch new [homepage](http://www.ecliptic.io) this weekend with a new design and integrated chat that connects directly to our team’s Slack account. In the meantime, [send me an email](mailto:brandon@ecliptic.io) and let’s talk!
