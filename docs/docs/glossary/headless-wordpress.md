---
title: Headless WordPress
disableTableOfContents: true
---

Learn what <q>headless WordPress</q> means, how it differs from other ways of using WordPress, and how you can use headless WordPress with Gatsby.

## What is Headless WordPress?

A _headless WordPress_ site is one that uses WordPress for managing content and some other custom frontend stack to display that content. Headless WordPress enables content writers to use a familiar interface while giving web developers the flexibility to use any frontend technology stack.

> Note: WordPress has two products: an open source, self-hosted package that you can [download](https://wordpress.org/) from WordPress.org; and a hosted service, [WordPress.com](https://wordpress.com/). This article applies to both.

Most WordPress installations use _themes_, which are a collection of template files, to display content. A WordPress template file mixes HTML with PHP template tags, and controls the layout of a particular page or page type — e.g. `single.php` for individual blog posts; `home.php` for the home page. The downside of this template-based system is that the content is only available as HTML, using the document structure defined by each template.

The WordPress REST API, on the other hand, returns JSON instead of HTML. Using a content API gives you more flexibility around what kind of frontend you use: vanilla JavaScript, a native mobile application, your Gatsby site, or all of the above.

Gatsby [supports WordPress](/docs/how-to/sourcing-data/sourcing-from-wordpress/) as a content source with the [`gatsby-source-wordpress`](/plugins/gatsby-source-wordpress/) plugin. As with Gatsby, you can install the `gatsby-source-wordpress` plugin using [npm](/docs/glossary/#npm):

```shell
npm install gatsby-source-wordpress
```

The `gatsby-source-wordpress` plugin works with self-hosted WordPress sites and those hosted by WordPress.com. Be aware, however, that the WordPress.com API supports a smaller set of features than that of self-hosted WordPress sites.

Headless WordPress enables content writers to use a familiar interface while giving web developers the flexibility to use any frontend technology stack.

## Learn More

- [Gatsby's WordPress integration](/plugins/gatsby-source-wordpress/) for headless WordPress projects
- [GraphQL for WordPress](https://www.wpgraphql.com/) open-source plugin
- [Why Gatsby chose WordPress](/blog/gatsby-blog-wordpress/) - a case study
