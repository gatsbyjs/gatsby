---

title: Headless CMS
disableTableOfContents: true

Learn what a Headless CMS is, how it differs from traditional content management systems, and why you might choose a headless CMS for your project.

## What is a Headless CMS?

A content management system, or CMS, is a software application that lets you edit and publish content for your website. Most content management systems store content in a database, and use a series of HTML-based template files to manage how that content gets presented.

A _headless CMS_, on the other hand, isn't concerned with presentation. Instead of merging templates and data to deliver HTML pages, headless content management systems return structured data from an [API](https://www.gatsbyjs.org/docs/glossary/#api) &mdash; usually JSON or unstyled XML. Content creators still use an editing interface to add content to a headless CMS, but the [backend](https://www.gatsbyjs.org/docs/glossary#frontend) management of the site's content is [_decoupled_](https://www.gatsbyjs.org/docs/glossary#decoupled) from the [frontend](https://www.gatsbyjs.org/docs/glossary#frontend) that displays it.

When your content is available as structured data, it's available to any client or application that can consume that data whether a [JAMStack](https://www.gatsbyjs.org/docs/glossary/jamstack) application, or a mobile device. You can use a headless CMS to provide [JSON content source](https://www.gatsbyjs.org/docs/sourcing-content-from-json-or-yaml/) for your Gatsby site and your other content channels.

With plugins, Gatsby supports several [headless CMS](https://www.gatsbyjs.org/docs/headless-cms/) services, including [Contentful](https://www.contentful.com/), [Ghost](https://ghost.org/pricing/) and [Prismic](https://prismic.io/). If you use WordPress, there's no need to switch. You can use WordPress' [REST API](https://www.gatsbyjs.org/docs/sourcing-from-wordpress/) as a headless CMS, so that your content team can continue to use the editing tools with which they're familiar.

## Learn More

- [What is a Headless CMS and How to Source Content from One](https://www.gatsbyjs.org/docs/headless-cms/), from the Gatsby docs
- [3 Free Headless CMS's for Your Next Project](https://www.gatsbyjs.org/blog/2019-10-15-free-headless-cms/), from the Gatsby blog
- [Building Sites with Headless CMSs](https://www.gatsbyjs.org/blog/2018-2-3-sites-with-headless-cms/#reach-skip-nav), also from Gatsby blog
