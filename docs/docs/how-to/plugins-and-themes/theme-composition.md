---
title: Theme Composition
---

When building themes, it's often worthwhile to consider how your theme can compose with others.
In some cases you might want to break your theme into modular parts, like `gatsby-theme-blog`
and `gatsby-theme-ecommerce`.

Since themes are still early, we recommend getting started by building themes that are more
monolithic. It's less overhead to get started and a theme can always be broken up into smaller
themes later.

## Layouts

In Gatsby themes you can apply global layouts by using [`wrapRootElement`](/docs/reference/config-files/gatsby-browser/#wrapRootElement)
or [`wrapPageElement`](/docs/reference/config-files/gatsby-browser/#wrapPageElement). For better theme
composition it's recommended to use this feature sparingly. It's a great fit for setting up any
necessary [React Context](https://reactjs.org/docs/context.html) providers. You shouldn't typically
add any layout components, such as headers or footers, because it will be applied globally which
could cause issues with other themes.

[Read more on layouts and Gatsby Themes](https://www.christopherbiscardi.com/post/layouts-in-gatsby-themes)
