---
title: Gatsby Themes
---

With the introduction of theming in Gatsby, it's easier than ever to get started building a Gatsby site.
Shared functionality, data sourcing, and design can all be prepackaged as a Gatsby Theme that's an NPM
install away.

Before the advent of themes, starters were the primary path for scaffolding a project with Gatsby.
This approach worked well for a long time.
However, as the community and ecosystem has grown, we’ve found starters to be lacking in a few ways:

- Can't be composed
- Difficult, if not impossible, to upgrade
- Introduce all code into your code base directly

Gatsby Themes solve these issues and drastically improve the end user experience by providing good defaults and easily extendable Gatsby site implementations.
It's also important to note that starters will still be usable with themes: the key difference is that starters now have the ability to ship the code as a theme library.
This means an install of a starter will consist of demo content and a compact `gatsby-config`.

### Related

- [Why Themes?](/blog/2019-01-31-why-themes/)
- [Themes Roadmap](/blog/2019-03-11-gatsby-themes-roadmap/)
- [Getting Started with Gatsby Themes and MDX](/blog/2019-02-26-getting-started-with-gatsby-themes/)
- [Watch Us Build a Theme Live](/blog/2019-02-11-gatsby-themes-livestream-and-example/)
- [Introducing Gatsby Themes by Chris Biscardi at Gatsby Days](https://www.gatsbyjs.com/gatsby-days-themes-chris/)
- [See all blog posts on themes](/blog/tags/themes)

## How Do They Work?

Gatsby themes work similarly to plugins, but at a new level of abstraction. They can add configuration to a project, implement pages, provide components, and set up data sources to query in GraphQL. Themes can also introduce other “parent” themes and plugins.

If you want to avoid things like GraphQL queries for common features in a blog, you can begin with a base theme and get started building and designing components. If you're comfortable in CSS and want to adjust the styling of a blog, that's an option, too! This makes building sites with Gatsby more accessible to a much larger audience. Down the road, if your blog gets more complex or your needs change, you can gradually introduce Gatsby's powerful GraphQL features.

Themes benefit starter authors since they can be shipped as libraries. This means that the functionality isn’t directly written into the project but as a dependency. Users can now seamlessly update your theme, compose them together, and even swap out one compatible theme for another.

## Why Does This Matter?

Theming in Gatsby means you can now avoid the boilerplate required when setting up a new project that’s commonplace in the community. That means we can arrive at a shared convention for something like a blog, and not be required to write GraphQL or configure a plugin unless you want to. No longer do you have to reinvent the wheel for each new Gatsby site you want to build.

It provides a foundation to build upon, and since themes can inherit from other themes you can focus on building out new abstractions or functionality. And by including [accessibility](./docs/themes/building-themes/#make-it-accessible-by-default) in your theme, you can contribute back to create a more accessible web!

## How Do You Customize a Theme?

Customizations can come in a couple different ways. Theme authors can expose configuration options for different layouts, colors, and other styling concerns. This allows for theme users to quickly toggle changes that are built into a theme for common use cases. This works great for swapping out a header layout or between light/dark mode. However, needing to make more bespoke changes is inevitable for the majority of projects.

Users can override any functionality or styling a theme introduces using component shadowing. This is a powerful API that allows you to customize any component or JavaScript file that lives in the source (`src`) directory. This API allows the user to change anything in a theme without hacks: all you have to do is follow a naming convention.

## What's Next?

- [Getting Started](/docs/themes/getting-started)
- [Converting a Starter](/docs/themes/converting-a-starter)
- [Building Themes](/docs/themes/building-themes)
- [Conventions](/docs/themes/conventions)
- [Theme Composition](/docs/themes/theme-composition)
- [API Reference](/docs/themes/api-reference)
