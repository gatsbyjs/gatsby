---
title: Announcing the Stable Release of Gatsby Themes!
date: 2019-07-03
author: Chris Biscardi
excerpt: "Gatsby themes go stable and what that means"
tags: ["themes"]
---

## What are Gatsby themes?

Using a Gatsby theme, all of your default configuration (shared functionality, data sourcing, design) is abstracted out of your site, and into an installable package.

This means that the configuration and functionality isn’t directly written into your project, but rather versioned, centrally managed, and installed as a dependency. You can seamlessly update a theme, compose themes together, and even swap out one compatible theme for another.

## What is "stable"?

The core theme APIs have been stable for a long time under the `__experimentalThemes` flag in `gatsby-config.js`. Since they're being used in production by a number of different companies to great effect, we're promoting these APIs, specifically composition and shadowing, to stable within Gatsby core so that people can take advantage of them with confidence.

## A brief review of composition

`gatsby-config` composition is the core abstraction behind how themes work. It means that you can write a `gatsby-config` in your plugin and it will be combined with any other plugin's `gatsby-config` and the site's `gatsby-config`. This results in a single combined `gatsby-config` that is then used to build your Gatsby project.

Stability for composition means that any plugin can now take advantage of adding configuration, plugins, and metadata via a `gatsby-config`. The `gatsby-config` in any plugin can be an object, similar to the way any Gatsby project works today, or a function whose argument is the options specified by a user.

```js:title=my-plugin/gatsby-config.js
module.exports = options => {
  return {
    plugins: [],
  }
}
```

These options can be used to conditionally add plugins, mappings, or anything else you can do in a `gatsby-config.js`.

## A brief review of shadowing

Shadowing allows you to override specific components by creating a new file and exporting a component from that file. If the theme you're using has a `Header` component at `my-theme/src/components/header.js` then you can replace the component in your own site by creating a new file at `my-site/src/my-theme/components/header.js`.

Stability for shadowing means that creating a single file is all you need to start changing how your theme renders your site. Additionally, we've added the ability to import and extend the parent component, allowing the use of props for customizing features of any React component.

```jsx:title=my-site/src/my-theme/components/header.js
import Header from "my-theme/src/components/header"

export default function MyHeader(props) {
  return <Header {...props} myProp={true} />
}
```

## What is different?

The best API is no API, so we're getting rid of the `__experimentalThemes` key in `gatsby-config.js` and enabling any plugin to participate in composition or shadowing. Themes are now "part of how Gatsby works" instead of being a separate API. It looks like this:

```js
module.exports = {
  plugins: [
    {
      resolve: "gatsby-theme-blog",
      options: {},
    },
  ],
}
```

note: `__experimentalThemes` is deprecated and we didn't remove it yet to allow time to migrate. Importantly there can be no `__experimentalThemes` usage if you want to use the new stable APIs in plugins. Migration is as easy as moving the theme declarations from `__experimentalThemes` to `plugins`.

## What else is there?

Over the course of the experimental life of themes we were often asked what themes are best to use. Until now we didn't have any officially supported themes to recommend. That changes today with the initial launch of two official themes: `gatsby-theme-blog` and `gatsby-theme-notes`.

The official themes are built with an opinionated approach that we've abstracted into a library called Theme UI. Theme UI encapsulates some of the best practices we've discovered while working on themes over the last few months and we hope you'll find it useful when building your own themes as well as working with the official themes.

[Read more](/blog/2019-07-03-customizing-styles-in-gatsby-themes-with-theme-ui/) about how to take advantage of the official themes and Theme UI.

## What's next?

In the future we'll work to make these features more accessible through tooling. Shadowing in particular is one area in which we are already experimenting with Gatsby CLI and GUI additions to display and eject shadowable components. While today you will have to rely on a theme's documentation, this additional tooling will make it easier to work with unfamiliar themes in the future.

[Check out the docs](https://www.gatsbyjs.org/docs/themes/) to get started!
