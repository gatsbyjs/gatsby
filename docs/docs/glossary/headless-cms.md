---
title: Headless CMS
disableTableOfContents: true
---

Learn what a Headless CMS is, how it differs from traditional content management systems, and why you might choose a headless CMS for your project.

## What is a Headless CMS?

A _headless content management system_ or _headless CMS_, is a CMS in which the content is separated from its presentation. Content management systems such as WordPress and Drupal store content in a database, and use a collection of HTML-based template files to manage how that content gets presented to visitors.

Headless content management systems, on the other hand, return structured data from an [API](/docs/glossary/#api). Rather than merging templates and content to create HTML, a headless CMS returns JSON or unstyled XML. Content creators still use an editing interface to add content to a headless CMS, but the [backend](/docs/glossary#backend) management of the site's content is [_decoupled_](/docs/glossary#decoupled) from the [frontend](/docs/glossary#frontend) that displays it.

When your content is available as structured data, it's available to any client or application that can consume that data whether a [JAMStack](/docs/glossary/jamstack/) application, or a mobile device. You can use a headless CMS to provide [JSON content source](/docs/how-to/sourcing-data/sourcing-from-json-or-yaml/) for your Gatsby site and your other content channels.

With plugins, Gatsby supports several [headless CMS](/docs/how-to/sourcing-data/headless-cms/) services, including [Contentful](https://www.contentful.com/), [Ghost](https://ghost.org/pricing/) and [Prismic](https://prismic.io/). If you use WordPress, there's no need to switch. You can use WordPress' [REST API](/docs/how-to/sourcing-data/sourcing-from-wordpress/) as a headless CMS, so that your content team can continue to use the editing tools with which they're familiar.

## Learn More

- [What is a Headless CMS and How to Source Content from One](/docs/how-to/sourcing-data/headless-cms/), from the Gatsby docs
- [3 Free Headless CMS's for Your Next Project](/blog/2019-10-15-free-headless-cms/), from the Gatsby blog
- [Building Sites with Headless CMSs](/blog/2018-2-3-sites-with-headless-cms/#reach-skip-nav), also from Gatsby blog
