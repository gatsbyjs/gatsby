---
title: What is a plugin?
---

Gatsby's plugin layer includes a wide variety of common website functionality that you can drop in to your website. There are many types of Gatsby plugins, including:

- **Integrations, or "source plugins".** These plugins pull data into Gatsby's GraphQL layer and make it available to query from your React components. Gatsby has source plugins for a wide range of headless CMSs, databases and spreadsheets, as well as the local filesystem. Here is a [guide on sourcing data](https://www.gatsbyjs.com/docs/how-to/sourcing-data/).

- **[Progressive images](/plugins/gatsby-plugin-image/)**

- **Dropping in analytics libraries** like [Google Analytics](/plugins/gatsby-plugin-google-analytics/), [Google Tag Manager](/plugins/gatsby-plugin-google-tagmanager), [Segment](/plugins/gatsby-plugin-segment-js), [Hotjar](/plugins/gatsby-plugin-hotjar/), and others.

- **Performance enhancements while using CSS libraries**, like [Sass](/plugins/gatsby-plugin-sass/), [styled-components](/plugins/gatsby-plugin-styled-components/) and [emotion](/plugins/gatsby-plugin-emotion/). These plugins are _not required_ to use these libraries but do make it easier and faster for the browser to parse styles.

- **Other website functionality**, like [SEO](/plugins/?=seo), [offline support](/plugins/gatsby-plugin-offline/), [sitemaps](/plugins/gatsby-plugin-sitemap/), and [RSS feeds](/plugins/gatsby-plugin-feed/).

One point of confusion people sometimes have is "when don't I need a plugin?" The answer is "most things"! As a general rule, any npm package you might use while working on another JavaScript or React application can also be used with a Gatsby application. Even when plugins are helpful, they are always optional.

Feel free to browse and search plugins at Gatsby's [Plugin Library](/plugins/) or read the documentation on [how to add a plugin](/docs/how-to/plugins-and-themes/using-a-plugin-in-your-site/).

Advanced use-cases include [making your own plugins](/docs/creating-plugins/) and either distribute them for fellow Gatsby developers to use or [install them locally](/docs/loading-plugins-from-your-local-plugins-folder/).
