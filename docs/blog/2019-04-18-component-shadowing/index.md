---
title: Component Shadowing
date: 2019-04-18
author: John Otander
excerpt: "Gatsby Themes introduce a concept called Component Shadowing. This feature allows
users to override a component in order to customize its rendering."
tags:
  - themes
---

Gatsby Themes introduce a concept called Component Shadowing. This feature allows
users to override a component in order to customize its rendering. Component Shadowing
is a powerful way to make one off changes to a theme without having to fully eject.

It's pretty common to end up with a theme where you're happy with 99% of the details
but want to customize the color palette and perhaps the author bio. This is where Component
Shadowing is an effective way to make changes quickly and intuitively.

## Shadowing Example

If you've installed `gatsby-theme-blog` you'll notice that it renders a
[Bio component](https://github.com/gatsbyjs/gatsby/blob/666a9bc3c8d91be8a3118b1128340a06e895735e/themes/gatsby-theme-blog/src/components/bio.js)
which is used in the BlogPost template. If you'd like to change the component you can do so
with Component Shadowing.

### Theme File Structure

`gatsby-theme-blog` has the following file structure (note that some files are
omitted for brevity):

```
gatsby-theme-blog
├── package.json
├── src
│   ├── components
│   │   ├── bio.js
│   │   ├── layout.js
│   │   ├── profile-pic.jpg
│   │   └── tokens
│   │       └── index.js
│   ├── gatsby-theme-blog-core
│   │   └── components
│   │       └── blog-post.js
│   └── utils
│       └── typography.js
```

### Implementing a Shadow

Component Shadowing uses a naming convention to determine which component will be rendered.
So, in order to override the Bio component in `gatsby-theme-blog` you'd create a file named
`src/gatsby-theme-blog/components/bio.js`.

Any file that lives in `src/gatsby-theme-blog/` of the user's site will be used _instead_ of a
file with the same name in `gatsby-theme-blog/src`.

This means that `src/gatsby-theme-blog/components/bio.js` will be rendered in place of
`gatsby-theme-blog/components/bio.js`:

```js:title=src/gatsby-theme-blog/components/bio.js
import React from "react"

export default () => <h1>My new bio component!</h1>
```

You'll result in the following directory tree:

```
site
  └── src
      └── gatsby-theme-blog
          └── components
              └── bio.js
```

Leveraging Component Shadowing is a powerful way to introduce small changes to a theme and
even layer in new functionality.

**Note**: In the future we'll publish a technical post that will dive into the internals
of Component Shadowing.

## Changing Styling

Component Shadowing isn't restricted to React components, you can override any
JavaScript/Markdown/MDX/CSS file. For example, `gatsby-theme-blog` has a
[design tokens file](https://github.com/gatsbyjs/gatsby/blob/666a9bc3c8d91be8a3118b1128340a06e895735e/themes/gatsby-theme-blog/src/components/tokens/index.js)
which is used to define font sizing, spacing, and colors. If you want to modify these
values you can shadow it.

To do so, you can create a file named `src/gatsby-theme-blog/components/tokens/index.js`.

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
site
  └── src
      └── gatsby-theme-blog
          └── components
              └── tokens
                    └──index.js
```

Now, blue and red will have your custom values and will be reflected in the theme wherever
`theme.colors.blue` and `theme.colors.red` are used.

#### How Much Shadowing is too Much Shadowing?

If you've found yourself shadowing a large amount of components in a particular theme it
might make sense to use a fork instead.

## Roadmap

In the future we'll be introducing new tooling to around Component Shadowing that will
list when shadowing occurs, what files are available to shadow, and the ability to eject
from a theme.

## Conclusion

Component Shadowing is a powerful feature for making small changes to a theme without the
need for complex configuration. It's a stable feature in Gatsby Themes and is currently
being used in production.

## Further Reading

- [Component Shadowing Documentation](https://www.gatsbyjs.org/docs/themes/api-reference/#component-shadowing)
- [Latent Component Shadowing](https://johno.com/latent-component-shadowing)
