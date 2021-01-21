---
title: Sourcing from Drupal
---

## Why use Drupal + Gatsby together?

Using Drupal as a headless CMS with Gatsby is a great way to get an enterprise-quality CMS for free, paired with a great modern development experience and all the benefits of the JAMstack, like performance, scalability, and security.

It only takes a few steps to use Gatsby with Drupal as a headless CMS (also known as decoupled Drupal).

[An example Gatsby + Drupal site](https://github.com/gatsbyjs/gatsby/tree/master/examples/using-drupal)

## How to implement Drupal + Gatsby

### Quick start

This guide assumes that you have a Gatsby project set up. If you need to set up a project, head to the [Quick Start guide](/docs/quick-start/), then come back.

### gatsby-config.js

Hooking up Gatsby to a new or existing Drupal site takes only a few steps.

- Follow the `gatsby-source-drupal` [installation instructions](/plugins/gatsby-source-drupal/?=drupal) to add the plugin to your Gatsby site

An example of how to include the `gatsby-source-drupal` plugin in your `gatsby-config.js` file:

```javascript:title=gatsby-config.js
module.exports = {
  siteMetadata: {
    title: `Gatsby with Drupal`,
  },
  plugins: [
    {
      resolve: `gatsby-source-drupal`,
      options: {
        baseUrl: `https://live-contentacms.pantheonsite.io/`,
        apiBase: `api`,
      },
    },
    {
      resolve: `gatsby-plugin-google-analytics`,
      options: {
        trackingId: `UA-93349937-2`,
      },
    },
    `gatsby-plugin-offline`,
    `gatsby-plugin-glamor`,
    `gatsby-plugin-sharp`,
    `gatsby-transformer-sharp`,
    {
      resolve: `gatsby-plugin-typography`,
      options: {
        pathToConfigModule: `src/utils/typography.js`,
      },
    },
  ],
}
```

## Why use Gatsby and Drupal together?

[“Decoupled Drupal”](https://www.acquia.com/drupal/decoupled-drupal) has become an increasingly popular approach to building enterprise-grade websites, and has the [full-throated support](https://dri.es/how-to-decouple-drupal-in-2018) of Drupal community leaders. Using Gatsby in a decoupled Drupal setup allows your team to access the powerful content modeling and access workflow capabilities of Drupal 8, as well as the powerful UI creation & performance toolset of Gatsby.

## Configuring Gatsby Live Preview

The [Gatsby Drupal Module](https://www.drupal.org/project/gatsby) enhances the content editor experience when using Gatsby with Drupal as a data source. This module provides Gatsby live preview capabilities using your [Gatsby Cloud account](/get-started) or on your [locally running Gatsby development server](/docs/how-to/local-development/running-a-gatsby-preview-server/).

While not required in order to build a Gatsby site that uses Drupal data, this module is the place where additional features are added to improve the Gatsby and Drupal integration.

## Interested in learning more?

Using Gatsby together with Drupal offers a powerful, full-featured, open-source, and free alternative to expensive enterprise content management systems. To learn more:

- Read a [Drupal agency’s introduction to Gatsby](https://www.mediacurrent.com/what-is-gatsby.js/)
- Watch [Kyle Mathews’ presentation on Gatsby + Drupal](https://2017.badcamp.net/session/coding-development/beginner/headless-drupal-building-blazing-fast-websites-reactgatsbyjs)
- Get started with Robert Ngo’s [Decoupling Drupal with Gatsby tutorial](https://evolvingweb.ca/blog/decoupling-drupal-gatsby) and watch his [Evolving Web 2018 Drupal conference presentation](https://www.youtube.com/watch?v=s5kUJRGDz6I)
- Example site that demonstrates [how to build Gatsby sites that pull data from the Drupal CMS](https://github.com/gatsbyjs/gatsby/tree/master/examples/using-drupal).
- Take a [free course on building a Gatsby site with Drupal](https://gatsbyguides.com/).
- Read [Gatsby blog posts on Gatsby + Drupal](/blog/tags/drupal/).
- Watch a [video series on getting started with Gatsby and Drupal](https://www.youtube.com/playlist?list=PL-Ve2ZZ1kZNT9BhQMMI9jUySfdnQ8-S3n).

<CloudCallout />
