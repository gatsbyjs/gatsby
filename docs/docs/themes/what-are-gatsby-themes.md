---
title: What Are Gatsby Themes?
---

**Gatsby themes** are plugins that include a `gatsby-config.js` file and add pre-configured functionality, data sourcing, and/or UI code to Gatsby sites. You can think of Gatsby themes as separate Gatsby sites that can be put together and allow you to split up a larger Gatsby project!

## Introduction

To introduce themes, let's walk through the journey that led to the creation of themes.

If you've ever created a Gatsby site completely from scratch, you know that there are a number of decisions to be made. Take, for example, creating a blog. You need to decide where your data will live, how it's accessed, how it's displayed and styled, etc.

### Gatsby starters

One existing way to quickly create Gatsby sites with similar functionality is to use "[Gatsby starters](/docs/starters/)". Starters are essentially Gatsby sites with pre-configured functionality for a particular purpose. You download an entire Gatsby site, pre-built for a particular purpose (e.g. blogging, portfolio site, etc) and customize from there.

These traditional starters take a first step toward reducing the level of effort involved in creating a new Gatsby site. However, there are two main problems with traditional starters:

- Sites created from a traditional starter have basically been "ejected" from the starter -- They maintain no connection to the starter, and begin to diverge immediately. If the starter is updated later, there's no easy way to pull upstream changes into an existing project.
- If you created multiple sites using the same starter, and later wanted to make the same update to all of those sites, you'd have to do them individually, site-by-site.

### Gatsby themes

Enter themes. Gatsby themes allow Gatsby site functionality to be packaged as a standalone product for others (and yourself!) to easily reuse. Using a traditional starter, all of your default configuration lives directly in your site. Using a theme, all of your default configuration lives in an npm package.

Themes solve the problems that traditional starters experience:

- Sites created using a Gatsby theme can adopt upstream changes to the theme -- themes are versioned packages that can be updated like any other package.
- You can create multiple sites that consume the same theme. To make updates across those sites, you can update the central theme and bump the version in the sites through `package.json` files (rather than spending the time to tediously update the functionality of each individual site).
- Themes are composable. You could install a blog theme alongside a notes theme, alongside an e-commerce theme (and so forth)

> A Gatsby theme is effectively a composable Gatsby config. They provide a higher-level approach to working with Gatsby that abstracts away the complex or repetitive parts into a reusable package.

## When should I use or build a theme?

**Consider using a theme if:**

- You already have an existing Gatsby site and can't start from a starter
- You want to be able to update to the latest version of a feature on your site
- You want multiple features on your site, but there is no starter with all the features -- you can use multiple themes, composed in one Gatsby site

**Consider building a theme if:**

- You plan on re-using similar functionality across multiple Gatsby sites
- You would like to share new Gatsby functionality to the community

## What's next?

- [Using a Gatsby Theme](/docs/how-to/plugins-and-themes/using-a-gatsby-theme)
- [Using Multiple Gatsby Themes](/docs/themes/using-multiple-gatsby-themes)
- [Shadowing](/docs/how-to/plugins-and-themes/shadowing/)
- [Building Themes](/docs/how-to/plugins-and-themes/building-themes)
- [Converting a Starter](/docs/how-to/plugins-and-themes/converting-a-starter/)
- [Theme Composition](/docs/how-to/plugins-and-themes/theme-composition/)
- [Conventions](/docs/how-to/plugins-and-themes/theme-conventions/)

## Related blog posts

For additional context, check out blog posts published during the development of themes:

- [Why Themes?](/blog/2019-01-31-why-themes/)
- [Themes Roadmap](/blog/2019-03-11-gatsby-themes-roadmap/)
- [Getting Started with Gatsby Themes and MDX](/blog/2019-02-26-getting-started-with-gatsby-themes/)
- [Watch Us Build a Theme Live](/blog/2019-02-11-gatsby-themes-livestream-and-example/)
- [Introducing Gatsby Themes by Chris Biscardi at Gatsby Days](https://www.gatsbyjs.com/gatsby-days-themes-chris/)
- [See all blog posts on themes](/blog/tags/themes)
