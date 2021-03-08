---
title: Decoupled Drupal
disableTableOfContents: true
---

Learn what <q>decoupled Drupal</q> means, how it differs from other ways of using Drupal, and how you can use decoupled Drupal with Gatsby.

## What is Decoupled Drupal?

_Decoupled Drupal_ is the practice of using Drupal as a [headless CMS](/docs/how-to/sourcing-data/headless-cms/) for your [JAMstack](/docs/glossary/jamstack/) site. Decoupled Drupal separates the content layer from the presentation layer, so that you can use Drupal with whatever frontend you choose.

In a tightly coupled Drupal architecture, themes control your site's appearance. A theme is a collection of HTML-based template files, each of which manages the layout for a particular Drupal node or content type.

When a visitor requests a URL, Drupal retrieves the requested content from the database and merges it with the appropriate template to create an HTML response. The downside of such an architecture is that your site's content is only available as HTML. HTML limits where and how your content can be used.

In a decoupled architecture, Drupal's only responsibility is content. Rather than returning HTML documents, Drupal returns JSON from its [REST](https://www.drupal.org/docs/8/api/restful-web-services-api/restful-web-services-api-overview) or [JSON:API](https://www.drupal.org/docs/8/modules/jsonapi/api-overview) interfaces. Or you can use [GraphQL](/docs/glossary/graphql/) by installing the [GraphQL module](https://www.drupal.org/docs/8/modules/graphql).

A decoupled Drupal architecture offers two key advantages over a tightly coupled one.

- **You can use one content management system to serve multiple frontends** — for example, your Gatsby site, your mobile application, and your smart TV application.
- **You can develop, change, and upgrade the frontend and backend independently of each other.** Upgrading Drupal doesn't require you to modify your site's appearance.

To use Drupal as a content source for Gatsby, add the [`gatsby-source-drupal`](/plugins/gatsby-source-drupal/) plugin to your project. As with Gatsby itself, you install the `gatsby-source-drupal` plugin using [npm](/docs/glossary/#npm).

```shell
npm install gatsby-source-drupal
```

A decoupled Drupal architecture lets you use the full power of Drupal's content management tools while gaining the performance advantages of a static Gatsby site.

## Learn more about decoupled Drupal

- Watch [Kyle Mathews’ presentation on Gatsby + Drupal](https://2017.badcamp.net/session/coding-development/beginner/headless-drupal-building-blazing-fast-websites-reactgatsbyjs)
- Documentation for the [GraphQL Drupal module](https://drupal-graphql.gitbook.io/graphql/)
- [Sourcing from Drupal](/docs/how-to/sourcing-data/sourcing-from-drupal/) in the Gatsby docs
