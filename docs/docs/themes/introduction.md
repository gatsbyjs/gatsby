---
title: Gatsby Themes
---

With the introduction of theming in Gatsby, it now becomes easier than ever to get started building a Gatsby site.
Shared functionality, data sourcing, and design is an npm install away.

Before the advent of themes, starters were the primary path for scaffolding a project with Gatsby.
This approach worked well for a long time.
However, as the community and ecosystem grows, we’ve found them to be lacking in a few ways:

- Can't be composed
- Difficult, if not impossible, to upgrade
- Introduce all code into your code base directly

Gatsby themes solve these issues and drastically improve the end user experience.
Not only have we built out a rich library of base themes for common functionality to build off of, we’ve introduced a collection of beautiful themes that you can install and get started with right away.
This includes blogs, landing pages, and even online stores.

It's also important to note that starters will still be usable with themes, the key difference is that starters now have the ability to ship the code as a theme library.

TODO: Perhaps show an example of a starter as a theme

TODO: Link Gatsby theme blog posts and Gatsby Days video

## How do they work?

Gatsby themes work similarly to plugins. They can add configuration to a project, implement pages, provide components, and set up data sources to query in GraphQL. Themes can also introduce other “parent” themes and plugins.

If you want to avoid things like writing GraphQL for common features in a blog, you can start with a base theme and get started writing/designing components. If you're comfortable in CSS to adjust the styling of a blog, that's always an option, too! Choose TODO (CSS blog starter). This makes building sites with Gatsby more accessible to a much larger audience. Down the road, if your blog gets more complex or your needs change, you can gradually introduce Gatsby's powerful GraphQL features.

Themes also benefit the authors of starters since they can be shipped as theme libraries. This means that the functionality isn’t directly written into your source code. Users can now seamlessly update your theme, compose them together, and even swap out one compatible theme for another.

## Why does this matter?

Theming in Gatsby means you can now avoid the boilerplate required when setting up a new project that’s commonplace in the community. That means we can arrive at a shared convention for something like a blog, and not be required to write GraphQL or configure a plugin unless you want to. No longer do you have to reinvent the wheel for each new Gatsby site you want to build.

It provides a foundation to build upon, and since themes can inherit from other themes you can you can focus on building out new abstractions or functionality.

## How do you customize a theme?

Customizations can come in a couple different ways. Theme authors can expose configuration options for different layouts, colors, and other styling concerns. This allows for theme users to quickly toggle changes that are built into a theme for common use cases. This works great for swapping out a header layout or between light/dark mode. However, needing to make more bespoke changes is inevitable for the majority of projects.

Users can also tweak anything else a theme introduces using component shadowing. This is a powerful API that allows you to customize any component or JavaScript file that lives in the source directory. This API allows the user to customize anything in a theme without hacks: all you have to do is follow a naming convention.

TODO: Code examples on component shadowing in action, also talk about file naming conventions, etc.
