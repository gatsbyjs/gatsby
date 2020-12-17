---
title: Headless WordPress
disableTableOfContents: true
---

Learn what <q>headless WordPress</q> means, how it differs from other ways of using WordPress, and how you can use headless WordPress with Gatsby.

## What is Headless WordPress?

_Headless WordPress_ is the practice of using WordPress as a [headless CMS](/docs/how-to/sourcing-data/headless-cms/) for your [JAMstack](/docs/glossary/jamstack/) site. Headless WordPress takes advantage of the WordPress REST API to separate its content from the frontend that displays it.

> Note: WordPress has two products: an open source, self-hosted package that you can [download](https://wordpress.org/) from WordPress.org; and a hosted service, [WordPress.com](https://wordpress.com/). This article applies to both.

Most WordPress installations use _themes_, which are a collection of template files, to display content. A WordPress template file mixes HTML with PHP template tags, and controls the layout of a particular page or page type — e.g. `single.php` for individual blog posts; `home.php` for the home page. The downside of this template-based system is that the content is only available as HTML, using the document structure defined by each template.

The WordPress REST API, on the other hand, returns JSON instead of HTML. Using a content API gives you more flexibility around what kind of frontend you use: vanilla JavaScript, a native mobile application, your Gatsby site, or all of the above.

Gatsby [supports WordPress](/docs/how-to/sourcing-data/sourcing-from-wordpress/) as a content source with the [`gatsby-source-wordpress`](/packages/gatsby-source-wordpress/) plugin. As with Gatsby, you can install the `gatsby-source-wordpress` plugin using [npm](/docs/glossary/#npm):

```shell
npm install gatsby-source-wordpress
```

The `gatsby-source-wordpress` plugin works with self-hosted WordPress sites, and those hosted by WordPress.com. Be aware, however, that the WordPress.com API supports a smaller set of features than that of self-hosted WordPress sites. It's also compatible with the [Advanced Custom Fields](https://www.advancedcustomfields.com/) plugin.

Headless WordPress lets your content team use an interface they're familiar with, while giving you the flexibility to use any frontend you'd like.

## Learn More

- [REST API Resources](https://developer.wordpress.com/docs/api/) from WordPress.com
- [WordPress REST API](https://developer.wordpress.org/rest-api/) for self-hosted WordPress
- [<q>How To Build A Blog with WordPress and Gatsby.js</q>](/blog/2019-04-26-how-to-build-a-blog-with-wordpress-and-gatsby-part-1/) from the Gatsby blog
