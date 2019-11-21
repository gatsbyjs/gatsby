---
title: What is Component Shadowing?
date: 2019-04-29
author: John Otander
excerpt: "Gatsby Themes introduce a concept called Component Shadowing. This feature allows
users to override a component in order to customize its rendering."
tags:
  - themes
---

Gatsby Themes introduce a concept called Component Shadowing. This feature allows
users to override a component in order to customize its rendering.

With other theming approaches it's impossible to change aspects of a theme if a
configuration option hasn't been built in. Component Shadowing provides a powerful
escape hatch to let users make quick, one-off changes that might not make sense to
support in the theme itself.

For example, imagine you've installed `gatsby-theme-blog` and want to customize the
author `Bio` component to add a link to their personal website. Before Component
Shadowing, this new functionality would require configuration at the theme level
or using a fork of the codebase. These approaches result in a difficult upgrade path
and a maintenance burden.

Component Shadowing let's you replace the theme's original file,
`gatsby-theme-blog/src/components/bio.js`, with your own to implement any changes you
need.

## Shadowing example

If you've installed `gatsby-theme-blog` you'll notice that it renders a
[`Bio` component](https://github.com/gatsbyjs/gatsby/blob/666a9bc3c8d91be8a3118b1128340a06e895735e/themes/gatsby-theme-blog/src/components/bio.js)
which is used in the `BlogPost` template. If you'd like to change the `Bio` component
you can do so with Component Shadowing.

### Theme File Structure

`gatsby-theme-blog` has the following file structure (some files have been omitted for
brevity):

```
gatsby-theme-blog
└── src
    ├── components
    │   ├── bio.js
    │   ├── layout.js
    │   ├── profile-pic.jpg
    │   └── tokens
    │       └── index.js
    └── utils
        └── typography.js
```

### Customizing the `Bio` component

Component Shadowing uses a naming convention to determine which component will be rendered.
In order to override the `Bio` component in `gatsby-theme-blog`, create a file named
`user-site/src/gatsby-theme-blog/components/bio.js`.

Any file that lives in the `src/gatsby-theme-blog` directory of the user's site will be
used _instead_ of a file with the same name in the theme's `src` directory:
`gatsby-theme-blog/src`.

This means that `user-site/src/gatsby-theme-blog/components/bio.js` will be rendered in place of
`gatsby-theme-blog/src/components/bio.js`:

```js:title=src/gatsby-theme-blog/components/bio.js
import React from "react"

export default () => <h1>My new bio component!</h1>
```

With a successful shadow of the `Bio` component you'll result in the following directory
tree:

```
user-site
└── src
    └── gatsby-theme-blog
        └── components
            └── bio.js
```

Leveraging Component Shadowing is a great way to introduce small changes to a theme and
even layer in new functionality.

**Note**: In the future we'll publish a technical post that will dive into the internals
of Component Shadowing.

## Changing styling

Component Shadowing isn't restricted to React components; you can override any
JavaScript, Markdown, MDX, or CSS file. For example, `gatsby-theme-blog` has a
[design tokens file](https://github.com/gatsbyjs/gatsby/blob/666a9bc3c8d91be8a3118b1128340a06e895735e/themes/gatsby-theme-blog/src/components/tokens/index.js)
which is used to define font sizing, spacing, and colors. If you want to modify these
values, you can shadow it.

To do so, create a file named
`user-site/src/gatsby-theme-blog/components/tokens/index.js`.

```js:title=src/gatsby-theme-blog/components/tokens/index.js
export default {
  fontSizes: [12, 14, 16, 24, 32, 48, 64, 96, 128],
  space: [0, 4, 8, 16, 32, 64, 128, 256],
  colors: {
    blue: `blue`,
    red: `tomato`,
  },
}
```

You'll result in the following directory tree:

```
user-site
└── src
    └── gatsby-theme-blog
        └── components
            └── tokens
                  └──index.js
```

Now, blue and red will have your custom values and will be reflected in the theme wherever
`theme.colors.blue` and `theme.colors.red` are used.

#### How much shadowing is too much shadowing?

If you've found yourself shadowing a large amount of components in a particular theme it
might make sense to use a fork instead.

## Roadmap

In the future we'll be introducing new tooling around Component Shadowing that will
list when shadowing occurs, what files are available to shadow, and the ability to eject
from a theme.

## Conclusion

Component Shadowing is a powerful feature for making one-off changes to a theme without the
need for complex configuration or maintaining a fork of the code. It's a stable feature in
Gatsby Themes and is currently being used in production.

## Further reading

- [Component Shadowing Documentation](/docs/themes/shadowing/)
- [Latent Component Shadowing](https://johno.com/latent-component-shadowing)
