---
title: Content Delivery Network (CDN)
disableTableOfContents: true
---

Learn what a content delivery network or CDN is, how a CDN works, and why you may want to use one for your site.

## What is a Content Delivery Network (CDN)?

A Content Delivery Network or CDN is a highly distributed network of servers that speed up the delivery of web content. A CDN copies content from an *origin* and [caches](/docs/glossary/#cache) it on servers around the world. CDN servers put your content closer to your site's visitors, and reduces the time needed to complete a network request.

Without a content delivery network, a request from Singapore to a server based in New York City has to hop through a network of servers separated by an ocean, and a continent — which can take several seconds. With a content delivery network, a request from Singapore may instead get a response from a CDN server based in Singapore, taking milliseconds.

By shortening the physical distance between request and response, you reduce the amount of _network latency_. Network latency is the amount of time it takes for a request to travel between computers. Less network latency means that your site loads more quickly, particularly for requests that are farther from the origin.

> NOTE: For a more complete explanation of how the internet works, watch [_How the Internet Works in 5 Minutes_](https://www.youtube.com/watch?v=7_LPdttKXPc).

An origin can be a traditional web server, or an object storage service such as [Amazon's S3](/docs/how-to/previews-deploys-hosting/deploying-to-s3-cloudfront/) or [Azure Storage](/blog/2018-11-05-deploying-gatsby-to-azure/). For content created by [static site generators](/docs/glossary/static-site-generator/), such as Gatsby, object storage is a quick and low-cost way to deploy a site to an origin. Object storage also eliminates the need to manage servers.

A CDN sits between your origin and the DNS servers that direct incoming requests to your site. When the CDN receives a request, it checks to see whether there's a copy of the resource in its cache. If there is, it responds with the cached resource. If there is not, the CDN requests it from the origin and caches the response. Future requests for that resource are then served from the cache.

Only a fraction of all requests to your website get forwarded to the origin. As a result, your origin uses a fraction of the bandwidth and compute cycles it would use without a CDN.

In sum, using a content delivery network can:

- improve your site's performance by reducing network latency;
- improve your site's resiliency by reducing the amount of traffic that reaches your origin server; and
- lower your outgoing transfer costs.

When used with object storage, you can also forgo the need for traditional servers.

## Learn more

- [How the Internet Works in 5 minutes](https://www.youtube.com/watch?v=7_LPdttKXPc)
- [Content delivery network](https://en.wikipedia.org/wiki/Content_delivery_network) from Wikipedia
- [Deploying and Hosting](/docs/deploying-and-hosting/) from the Gatsby docs
