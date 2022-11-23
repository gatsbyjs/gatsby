---
title: What is Headless WordPress?
disableTableOfContents: true
---

Learn what headless WordPress means, how it differs from other ways of using WordPress or other types of Content Management Systems, and how you can use headless WordPress with Gatsby.

### First, what is a Headless CMS?

A [headless CMS](/docs/glossary/headless-cms/) is a Content Management System that uses a decoupled architecture to allow it to act as a backend service accessed via an API or SDK. Traditionally, CMS have acted as both the frontend (presentation layer) and backend (content database) for content editing. With a headless implementation, the CMS only acts in the capacity of content editing and the frontend is served by another solution - like Gatsby.

## Headless WordPress

A _headless WordPress_ site is one that uses [WordPress](/solutions/wordpress) for managing content and some other custom frontend stack to actually display that content to a site visitor. While a site built with headless WordPress has many benefits, one of the primary advantages of this approach is decoupling content editing teams and developers.

With Headless WordPress, a marketing team and content team can continue to use their familiar WordPress interface and the development team can use the tools they love like React, GraphQL, in a Git workflow they are comfortable with.

## The Drawbacks of a Monolithic WordPress

Most WordPress installations use _themes_, which are a collection of template files, to display content. A WordPress template file mixes HTML with PHP template tags, and controls the layout of a particular page or page type — e.g. `single.php` for individual blog posts; `home.php` for the home page. The downside of this template-based system is that the content is only available as HTML, using the document structure defined by each template.

Traditional WordPress also renders content to the site visitor via [server-side rendering](/docs/glossary/server-side-rendering/), since it's PHP, which can hurt performance when compared to other methods of page generation, such as static site generation. Each time a visitor visits a new page, the browser reaches out to the web server and grabs all the content needed - slow processes that ultimately hurt the experience of a website.

The WordPress REST API, on the other hand, returns JSON instead of HTML. Using a content API gives you more flexibility around what kind of frontend you use: vanilla JavaScript, a native mobile application, your Gatsby site, or all of the above.

## The Benefits of Headless WordPress

### Faster Performance

WordPress websites that are powered by frontends like Gatsby are incredibly smooth and responsive, with millisecond load times and prefetched delivery on the edge.

### Improved Security

Static-Site Generators, like Gatsby, acting as a frontend for WordPress have no active web servers and no reachable database, thus presenting a smaller attack surface. This approach prevents malicious requests, DDoS attacks, and accidental exposure.

### Greater Flexibility

Frontends such as Gatsby can integrate WordPress content into complex, organization-wide websites which may combine WordPress content with content from other CMSs and web services.

## Getting Started

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
