---
title: Plugins, Themes, & Starters
overview: true
---

In the Gatsby ecosystem, there's more than one way to build a site. To help you understand the differences between plugins, themes, and starters, this guide will talk through some of the details.

## What is a plugin?

Gatsby plugins are Node.js packages that implement Gatsby APIs and are commonly installed through a registry like npm. There are many types of [plugins](/plugins/), including data sourcing, SEO, responsive images, offline support, support for Sass, TypeScript, sitemaps and RSS, Google Analytics, and more. You can also [make your own plugins](/docs/creating-plugins/) and either distribute them for fellow Gatsby developers to use or [install them locally](/docs/loading-plugins-from-your-local-plugins-folder/).

- [Plugin docs](/docs/plugins/)
- [Using a plugin](/docs/using-a-plugin-in-your-site/)
- [Plugin library](/plugins/)
- [Creating plugins](/docs/creating-plugins/)

## What is a theme?

A Gatsby theme is a type of plugin that includes a `gatsby-config.js` file and adds pre-configured functionality, data sourcing, and/or UI code to Gatsby sites. Since they are plugins, themes can be packaged and distributed through a registry like npm or yarn, and versions can be updated through a site's `package.json` file.

With a Gatsby theme, all of your default configuration (shared functionality, data sourcing, design) is abstracted out of your site and into an installable package. A theme might differ from a typical plugin in that it packages up usage of a plugin into a consumable API, making it easy to include functionality without having to type out all of the code by hand (such as GraphQL queries). To understand more of the motivation for Gatsby themes, check out the docs on [What are Gatsby Themes?](/docs/themes/what-are-gatsby-themes/)

- [Themes docs](/docs/themes/)
- [Using a theme](/docs/themes/using-a-gatsby-theme/)
- [Themes in plugin library](/plugins/?=gatsby-theme)
- [Creating a theme](/docs/themes/building-themes/)

## What is a starter?

A starter is a boilerplate Gatsby site that users can copy and [customize](/docs/modifying-a-starter/). Once modified, a starter maintains no connection to its source.

Gatsby offers [official starters](/docs/starters/#official-starters) for a default site, blog site, bare-bones hello world site, and both using and creating themes. There are also many starters from members of the community that can provide a good starting point for your Gatsby site.

- [Starter docs](/docs/starters/)
- [Modifying a starter](/docs/modifying-a-starter/)
- [Starter library](/starters/)
- [Creating a starter](/docs/creating-a-starter/)
- [Converting a starter to a theme](/docs/themes/converting-a-starter/)
