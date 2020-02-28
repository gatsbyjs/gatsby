---
title: Using Multiple Themes Together
---

## What’s contained in this tutorial?

By the end of this tutorial, you’ll have done the following:

- learned how to compose multiple Gatsby themes into a final site
- learned about component shadowing
- learned about shadowing a Theme-UI theme file

The themes we will be composing in this tutorial are [gatsby-theme-blog](https://www.gatsbyjs.org/packages/gatsby-theme-blog/), [gatsby-theme-notes](https://www.gatsbyjs.org/packages/gatsby-theme-notes/) and [gatsby-mdx-embed](https://gatsby-mdx-embed.netlify.com/). Follow along as we go from 'hello-world' to a fully functioning final site!

## Prerequisites

This tutorial assumes you have a basic working knowledge of Gatsby and are comfortable with the [Gatsby fundamentals](https://www.gatsbyjs.org/tutorial/using-a-theme/)

## Step 0: A mental model of Gatsby themes

If you have worked with Wordpress or a similar CMS you have likely used a 'theme' or a 'template' before. Often this is a singular theme which controls the appearance and function of your entire site. You can install new themes, but _not_ multiple themes together.

Gatsby themes are different.

Insert analogy here...maybe using building blocks/lego. Got to think this through.

## Step 1: Create a new site using the hello world starter

```shell
gatsby new multiple-themes https://github.com/gatsbyjs/gatsby-starter-hello-world
```

## Step 2: Install the themes

The first two themes we will compose together are [gatsby-theme-blog](https://www.gatsbyjs.org/packages/gatsby-theme-blog/) and [gatsby-theme-notes](https://www.gatsbyjs.org/packages/gatsby-theme-notes/).

```shell
npm install gatsby-theme-blog gatsby-theme-notes
```

## Step 3: Update gatsby-config.js

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

## Step 4: Run the site

Next, run the site and see what you have:

```shell
cd multiple-themes
gatsby develop
```

## Step 5: Add some content

Not much to look at yet, just a plain `hello-world`, but it works! Behind the scenes our two themes [created content folders](https://www.gatsbyjs.org/docs/themes/conventions/#initializing-required-directories) for us in the root directory of the site. We need to add some content to these folders now.

Put an avatar image into `content/assets/avatar.png`.

Add at least one post and one note, a bit like this:

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

## Step 6: Run the site again

```shell
gatsby develop
```

Now if you visit `localhost:8000/blog` and `localhost:8000/notes` there you should see some content to look at.

## Step 7: Put the blog posts on the homepage

Let's get rid of our plain hello world homepage and use the blog posts.

- Stop your development server, `CTRL + C`.
- Delete `src/pages/index.js`.
- Change the theme options for the blog theme in `gatsby-config.js`.
- Restart your development server with `gatsby develop`.

```javascript:title=gatsby-config.js
{
      resolve: `gatsby-theme-blog`,
      options: {
        // basePath defaults to `/`
        basePath: `/`,
      },
    },
```

## Step 8: Shadow the 'bio-content.js' component

Your name probably isn't Jane Doe. Let's fix that with a custom `bio-content.js` component using [theme shadowing](https://www.gatsbyjs.org/docs/themes/shadowing/). Don't forget to stop and restart your development server when adding a shadowed component the first time. Your file structure should look like this:

```text:title="File Structure"
└── src
    ├── gatsby-theme-blog
    │   ├── components
    │   │   ├── bio-content.js // highlight-line
```

And your component might look like this:

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

## Step 9: Shadow the Theme-UI theme file

Gatsby Theme Blog and Gatsby Theme Notes both use [Theme-UI](https://www.gatsbyjs.org/docs/theme-ui/) design tokens to manage their styling; colors, font sizes, spacing, etc. We can use component shadowing to gain control over these design tokens in our final site. Don't forget to stop and restart your development server when adding a shadowed component the first time. Your file structure should look like this:

```text:title="File Structure"
└── src
    ├── gatsby-plugin-theme-ui
    │   ├── index.js //highlight-line
```

And your component could look like this:

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

## Step 10: Add a smaller theme

Themes can be big, like `gatsby-theme-blog`, but they can also be small discrete sets of components or functions. A great example of this is [gatsby-mdx-embed](https://gatsby-mdx-embed.netlify.com/) which adds the ability to easily embed social media content and videos into your MDX.

Let's install the theme.

```shell
npm install @pauliescanlon/gatsby-mdx-embed
```

Add it to your plugins.

```javascript:title=gatsby-config.js
module.exports = {
  ...
  plugins: [`@pauliescanlon/gatsby-mdx-embed`]
  ...
}
```

Test it out by adding a Youtube video to one of your blog posts.

```md:title=content/posts/hello-posts.mdx
---
title: My first blog post
date: 2020-02-15
---

Multiple themes are great! Here is a video about composing and styling themes with Jason and Jackson!

<YouTube youTubeId="6Z4p-qjnKCQ" />
```

## Step 11: Add a custom navigation menu

Wouldn't it be nice to navigate to your notes page more easily. Let's add some simple navigation links to your site using component shadowing.

## What's next

Keep creating, customizing and working on your own site. Share what you make on Twitter with the [#builtwithgatsby](https://twitter.com/hashtag/builtwithgatsby) hashtag. Moving beyond using themes you can start [creating your own themes](https://www.gatsbyjs.org/tutorial/building-a-theme/) and releasing theme for the world to enjoy!

## Other resources

- [Egghead.io Course: Gatsby Theme Authoring (free)](https://egghead.io/courses/gatsby-theme-authoring)
- [Setting up yarn workspaces for Gatsby theme development](https://www.gatsbyjs.org/blog/2019-05-22-setting-up-yarn-workspaces-for-theme-development/#reach-skip-nav)
- [Composing and styling Gatsby themes (with Brent Jackson) — Learn With Jason](https://www.youtube.com/watch?v=6Z4p-qjnKCQ)
- [Build a Personal Site Using Gatsby Themes (with Will Johnson) — Learn With Jason](https://www.youtube.com/watch?v=vf2Dy_xKUno)
-
