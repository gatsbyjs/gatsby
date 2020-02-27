---
title: Using Multiple Themes Together
---

In this tutorial, you'll learn how to use multiple Gatsby themes by creating a new site using `gatsby-theme-blog`, `gatsby-theme-notes` and `@pauliescanlon/gatsby-mdx-embed`.

## A mental model of Gatsby themes

If you have worked with Wordpress or a similar CMS you have likely used a 'theme' or a 'template' before. Often this is a singular theme which controls the appearance and function of your entire site. You can install new themes, but not multiple themes together.

Gatsby themes are different.

They are a bit like a toy building block set which can be linked together with other sets to form a final scene. These themes or 'sets-of-blocks' can be big and stylish, but also small and simple. Imagine that you are building a town scene using building blocks. You might have a fire station set (big and complicated), an ice cream truck set (medium sized), and a swing set (small and simple). These sets can be arranged together however you want to form a final scene.

Themes in Gatsby work in a similar way. They are 'sets-of-components' that can be composed together by the developer in unique ways to form your final site. They range from large, site-wide themes, to very small themes that control only a single aspect of your site.

Follow along as we go from 'hello-world' to a fully functioning final site!

## Create a new site using the hello world starter

```shell
gatsby new multiple-themes https://github.com/gatsbyjs/gatsby-starter-hello-world
```

## Install the themes

The first two themes we will compose together are [gatsby-theme-blog](https://www.gatsbyjs.org/packages/gatsby-theme-blog/) and [gatsby-theme-notes](https://www.gatsbyjs.org/packages/gatsby-theme-notes/).

```shell
npm install gatsby-theme-blog gatsby-theme-notes
```

## Update gatsby-config.js

The themes need to be added to the plugins array and an we need some basic site metadata as well.

```javascript:title=gatsby-config.js
module.exports = {
  siteMetadata: {
    title: `Multiple Themes`,
    description: `A tutorial for building a Gatsby site using multiple themes.`,
    author: `Your name`,
    social: [
      {
        name: `twitter`,
        url: `https://twitter.com/gatsbyjs`,
      },
      {
        name: `github`,
        url: `https://github.com/gatsbyjs`,
      },
    ],
  },
  plugins: [
    {
      resolve: `gatsby-theme-blog`,
      options: {
        // basePath defaults to `/`
        basePath: `/blog`,
      },
    },
    {
      resolve: `gatsby-theme-notes`,
      options: {
        // basePath defaults to `/`
        basePath: `/notes`,
      },
    },
  ],
}
```

## Run the site

Next, run the site and see what you have:

```shell
cd multiple-themes
gatsby develop
```

## Add some content

Not much to look at yet, just a plain `hello-world`, but it works! Behind the scenes our themes [created some content folders](https://www.gatsbyjs.org/docs/themes/conventions/#initializing-required-directories) for us in the root of your site. We need to add some content to these folders now. Put an avatar image into `content/assets/avatar.png`. Add a post and a note, a bit like this:

```md:title=content/posts/hello-posts.mdx
---
title: My first blog post
date: 2020-02-15
---

Multiple themes are great!
```

```md:title=content/note/hello-notes.mdx
---
title: My first note
date: 2020-02-20
---

Multiple themes are awesome!
```

## Run the site again

```shell
gatsby develop
```

Now there will be some content to look at if you go to `localhost:8000/blog` and `localhost:8000/notes`.

## Put the blog posts on the homepage

Let's get rid of our plain hello world homepage and use the blog posts. Stop your development server, `CTRL + C`. Delete `src/pages/index.js`. Change the theme options for the blog theme in `gatsby-config.js`. Restart your development server with `gatsby develop`.

```javascript:title=gatsby-config.js
{
      resolve: `gatsby-theme-blog`,
      options: {
        // basePath defaults to `/`
        basePath: `/`,
      },
    },
```

## Shadow the 'bio-content' component

Your name probably isn't Jane Doe. Let's fix that with a custom `bio-content.js` component using [theme shadowing](https://www.gatsbyjs.org/docs/themes/shadowing/). Don't forget to stop and restart your development server when adding a shadowed component the first time. Your file structure should look like this:

```text:title="File Structure"
└── src
    ├── gatsby-theme-blog
    │   ├── components
    │   │   ├── bio-content.js // highlight-line
```

And your component should look like this:

```jsx:title=bio-content.js
import React, { Fragment } from "react"
import { Styled } from "theme-ui"

export default () => (
  <Fragment>
    Words by <Styled.a href="http://example.com/">Your Name</Styled.a>.
    <br />
    Change me. Your awesome bio, about how great you are at super stuff!
  </Fragment>
)
```

## Shadow the Theme-UI theme file

Gatsby Theme Blog and Gatsby Theme Notes both use [Theme-UI](https://www.gatsbyjs.org/docs/theme-ui/) design tokens to manage their styling; colors, font sizes, spacing, etc. We can use component shadowing to gain control over these design tokens in our final site. Don't forget to stop and restart your development server when adding a shadowed component the first time. Your file structure should look like this:

```text:title="File Structure"
└── src
    ├── gatsby-plugin-theme-ui
    │   ├── index.js //highlight-line
```

And your component should look like this:

```javascript:title=index.js
import merge from "deepmerge"
import defaultTheme from "gatsby-theme-blog/src/gatsby-plugin-theme-ui/index"

export default merge(defaultTheme, {
  colors: {
    text: "green",
    primary: "salmon",
    heading: "pink",
    modes: {
      dark: {
        background: "blue",
        primary: "teal",
        highlight: "red",
      },
    },
  },
})
```

## Add a smaller theme

- Something like gatsby-mdx-embed, a smaller theme that adds component level function to demonstrate what a smaller theme can do.

## Add a custom navigation menu

- Create a nav menu to get to the notes page

## Next steps

- Some ideas for next steps someone could take in theme development and work
