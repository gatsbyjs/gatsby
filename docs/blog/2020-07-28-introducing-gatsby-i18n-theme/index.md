---
title: "Gatsby Goes Global: Announcing Gatsby's Official i18n Theme"
date: 2020-07-28
author: Lennart Jörgens
excerpt: "Users of the theme get access to specialized React components that help with building a multilingual site. In addition the theme helps to automate most of the manual tasks required to add i18n support to MDX-based websites."
tags:
  - i18n
---

**A first step towards first-class internationalization support in Gatsby.**

Today I'm excited to announce `gatsby-theme-i18n`, along with adjacent library specific i18n themes. This marks a significant milestone in Gatsby's efforts to treat internationalization (i18n) as a first-class citizen. Users of the theme get access to specialized React components that help with building a multilingual site. In addition, the theme helps to automate most of the manual tasks required to add i18n support to MDX-based websites. For many Gatsby users, internationalization is more than a means to help make the web more accessible and inclusive. It’s also business critical: global users increasingly want to consume content in their preferred language -- and quickly navigate away from websites (and brands) that fail to provide it.

Up until now, setting up a site with i18n support has not been as easy as spinning up a normal Gatsby site, especially for beginners. My previous post [Research on i18n with Gatsby](/blog/2020-07-13-i18n-pain-points/) discussed how setting up a site for internationalization and/or localization requires knowledge about lower-level APIs, building customized components, and a sense for which particular changes risk degrading Gatsby’s built-in performance benefits. Moreover, a substantial number of users want to add i18n to an existing site and face problems integrating those changes into their current setup.

We built `gatsby-theme-i18n` to be opinionated enough to let you build a MDX-based website without needing to configure much...While at the same time providing utilities and components for users with a more advanced use case or an already existing site.

You can get started by installing the theme:

```shell
npm install gatsby-theme-i18n
```

The [install instructions](https://github.com/gatsbyjs/themes/tree/master/packages/gatsby-theme-i18n) are on GitHub for now. More detailed documentation will follow.

If you prefer to get started with a starter, you can clone this project:

```shell
gatsby new i18n-theme https://github.com/LekoArts/gatsby-starter-theme-i18n
```

This will scaffold a project already set up with `gatsby-theme-i18n` and MDX. The starter also shows you the usage of the mentioned React components like `LocalizedLink`. The different pages get created for `.js` files inside `src/pages` and in the `blog` directory.

## Child themes for react-intl, react-i18next & Lingui

`gatsby-theme-i18n` doesn't ship with a default localization library, so it is agnostic to all i18n libraries -- any library can be used. You have the choice of implementing those on your own, or choose one of currently three available dedicated child themes: [react-intl](https://github.com/gatsbyjs/themes/tree/master/packages/gatsby-theme-i18n-react-intl), [react-i18next](https://github.com/gatsbyjs/themes/tree/master/packages/gatsby-theme-i18n-react-i18next), and [Lingui](https://github.com/gatsbyjs/themes/tree/master/packages/gatsby-theme-i18n-lingui).

By installing those themes you get access to your translation files on every page as they wrap your application with the necessary context providers.

Here's how to add `gatsby-theme-i18n-react-intl` to the project that was scaffolded above (with `gatsby-starter-theme-i18n`).

First, install the necessary dependencies (theme & peer dependencies):

```shell
npm install gatsby-theme-i18n-react-intl react-intl
```

Add the theme to your gatsby-config.js:

```js:title=gatsby-config.js
{
  resolve: `gatsby-theme-i18n-react-intl`,
  options: {
    defaultLocale: `./i18n/react-intl/en.json`,
  },
},
```

Create a new folder at `i18n/react-intl` and create two new files inside that folder called `de.json` and `en.json`. As seen above in the config the `en.json` will be the default locale.

Fill `en.json` with the content:

```json
{
  "helloWorld": "Hello World"
}
```

And `de.json` with:

```json
{
  "helloWorld": "Hallo Welt"
}
```

Now you’re ready to localize content! Go to your `src/pages/index.js` file and reference the JSON files you just created. Import `useIntl` from `react-intl` and translate `Hello World`:

```diff:title=src/pages/index.js
  import * as React from "react"
  import { graphql } from "gatsby"
  import { LocalizedLink, LocalesList } from "gatsby-theme-i18n"
+ import { useIntl } from "react-intl"
  import Layout from "../components/layout"
  import SEO from "../components/seo"

  const Index = ({ data }) => {
+   const intl = useIntl()
    return (
      <Layout>
        <SEO title="Home" />
+       <h1>{intl.formatMessage({ id: "helloWorld" })}</h1>
        <p>This is in the Index page.</p>
```

After starting the development server, visit `http://localhost:8000` and `http://localhost:8000/de/` to see both texts.

## FAQs

### Where is the source code and how should I report bugs/requests?

The packages are located at the newly created [gatsbyjs/themes](https://github.com/gatsbyjs/themes) repository.

Please comment on the [umbrella issue](https://github.com/gatsbyjs/themes/issues/43).

### Why start with a theme for a first-class integration?

A theme is the best place to start exploring how a first-class support in Gatsby can look like as it’s separate from Gatsby’s versioning and allows for more experiments. It’s also able to be opinionated about things like styling by e.g. using Theme UI. Or provide additional components. Or be combined with additional, more opinionated themes on top. Some of the current pain points for i18n in Gatsby (that are not exclusive to i18n) can only be solved in Gatsby’s core codebase.

### What areas of i18n are we focusing on to begin with?

As i18n is a complex topic and a lot of things need to be considered, the theme starts with things that you can already solve yourself today by using Gatsby’s APIs, custom React components or adding libraries. Hence the first goals are:

- Scoping out how opinionated (and in which way) things like the file structure for the content should be
- Building a robust system around programmatically creating pages from the content
- Creating reusable React components that can help with e.g. adding the necessary `<head>` tags.
- Building integrations with localization libraries

### What areas are we not solving initially?

Support for every CMS that exists.

Our starting point is to focus on MDX and get that right. Next we will explore how to provide utilities or fully support other APIs. Plug’n’play support for internationalization and localization services like [Crowdin](https://crowdin.com/). Changing how Gatsby generates its assets to minimize duplication and reduce build times is another focus area. All these priorities mean it’s going to be awhile before we can get to specific support for every CMS ever.

### Can these improvements be ported over to Gatsby’s core codebase?

Time will tell what parts can be ported over to Gatsby’s codebase and what needs to stay in a theme. The improvements made to the core codebase in order to support this i18n effort will benefit all Gatsby users since many, if not most, of those features might also unlock other use cases. The theme will most likely always exist in some form since not everything can be directly baked into Gatsby core.

### Why a theme and not a plugin?

Composability is a major consideration for “Themes” and it should probably be more clear that you should work on top of it rather than it being a one-fits/one-click solution. We also might need to make use of `gatsby-config.js` which can only be used in a theme package.

### Can I use i18n library X with this theme?

Again, `gatsby-theme-i18n` is agnostic, so any library can be used. We recommend sticking with these three libraries as we have created dedicated themes for them: [react-intl](https://www.npmjs.com/package/react-intl), [react-i18next](https://react.i18next.com/), and [Lingui](https://lingui.js.org/).

### How does the theme compare to existing community plugins?

Some i18n plugins are specific in their scope, created without scalability/performance in mind, or lack a sufficient documentation. We’re happy our awesome community created these, and we definitely draw inspiration from them. However, to be able to move forward quickly we need to maintain a theme on our own.

### How will we make i18n really good in Gatsby?

As already stated, i18n is a hard topic to solve, especially in a more generic approach. Hence, we’re starting out with a theme that we can iterate on quickly and people can use instantly.

We love our community and thus want to encourage all users to try the theme out. It’s super valuable for us to see how people want to use it and/or want to set up i18n on their site. It’ll break or things won’t work in the beginning, but we really see this as a collaborative effort.

Since i18n is not only about the tooling but also processes we’re also interested in knowing how our users want to approach it from an organizational standpoint, e.g. wanting to create multiple sites or having everything in one project.

If you want to help us and give us direct feedback, you can join this [Discord channel](https://discord.gg/cQ2MPUz).
