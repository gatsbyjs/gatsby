---
title: What is a Headless Content Management System (CMS)?
disableTableOfContents: true
---

Learn what a headless CMS is, how it differs from traditional content management systems, and why you might choose a headless CMS for your project.

## What is a Headless CMS?

A headless content management system or headless CMS, is a CMS in which the data (content) layer is separated from its presentation (frontend) layer.

Content management systems, such as [WordPress](https://wordpress.org/) and [Drupal](https://www.drupal.org/) store content in a database, and use a collection of HTML-based template files to manage how that content gets presented to visitors. Many of these content management systems deliver content via [server-side rendering](/docs/glossary/server-side-rendering/), which can hurt load times and slow down a site visitor's experience.

Headless content management systems, on the other hand, return structured data via an [API](/docs/glossary/#api).
When your content is available as structured data, it's available to any client or application that can consume that data whether a [Jamstack](/docs/glossary/jamstack/) application, or a mobile device. Rather than merging templates (the presentation layer) and content (the data layer) to create HTML, a headless CMS returns JSON or unstyled XML which can be compiled and optimized by frontend frameworks like Gatsby for faster performance.

With a headless CMS, marketers and content creators still use an WYSIWYG-like editing interface to add content to a headless CMS - it looks very similar or exactly the same as a backend like WordPress. But when the [backend](/docs/glossary#backend) management of the site's content is [decoupled](/docs/glossary#decoupled) from the [frontend](/docs/glossary#frontend) that displays it, developers can use the tools they love to create flexible, beautiful interfaces. They are free to use tools like React and GraphQL and a Git workflow to create fast, secure, scalable sites.

## Benefits Of Headless Architecture

### Speed

Decoupled frontends offer superior speed to monolithic systems by combining deep performance optimizations with a smaller server-side footprint.

### Security

Headless systems present a smaller attack surface to malicious attacks since they have fewer open connections to open servers or databases.

### Scalability

Traditional CMS's are prone to getting knocked-off line with too much traffic. Decoupled frontends can be served statically on a CDN, which can handle millions of requests per second with little to no problem.

### Flexibility

Create powerful digital experiences by combining content from several different data sources or use a central CMS to send content to several different websites.

## Headless Content Management Systems & Gatsby

With plugins, Gatsby supports several [headless CMS](/docs/how-to/sourcing-data/headless-cms/) services, including [Contentful](https://www.contentful.com/), [Ghost](https://ghost.org/pricing/) and [Prismic](https://prismic.io/). If you use WordPress, there's no need to switch. You can use WordPress' [REST API](/docs/how-to/sourcing-data/sourcing-from-wordpress/) as a headless CMS, so that your content team can continue to use the editing tools with which they're familiar.

### Learn More

- [How to Source Content from a Headless CMS](/docs/how-to/sourcing-data/headless-cms/)
