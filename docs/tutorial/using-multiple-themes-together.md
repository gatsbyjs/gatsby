---
title: Using Multiple Themes Together
---

## What this tutorial covers

This tutorial covers how to compose multiple themes into a final site using [gatsby-theme-blog](/plugins/gatsby-theme-blog/), [gatsby-theme-notes](/plugins/gatsby-theme-notes/) and [gatsby-mdx-embed](/plugins/@pauliescanlon/gatsby-mdx-embed/) as examples. It will also cover the concept of component shadowing with [Theme-UI](/docs/how-to/styling/theme-ui/) for styling.

## Prerequisites

This tutorial assumes the following:

- That you have an understanding of [Gatsby fundamentals](/tutorial/#gatsby-fundamentals)
- An existing knowledge of [Gatsby Themes](/docs/themes/what-are-gatsby-themes/)

## Example repository

You can view a [full working example of this tutorial](https://github.com/gatsbyjs/gatsby/tree/master/examples/using-multiple-themes) on GitHub. Some longer code snippets have been edited for length and the full code is available for reference in the example repository.

## Create a new site

Using the hello world starter create a new site and navigate to that directory.

```shell
gatsby new multiple-themes https://github.com/gatsbyjs/gatsby-starter-hello-world
cd multiple-themes
```

## Install and compose the themes

This step composes [gatsby-theme-blog](/plugins/gatsby-theme-blog/) and [gatsby-theme-notes](/plugins/gatsby-theme-notes/).

1. Install the themes:

```shell
npm install gatsby-theme-blog gatsby-theme-notes
```

2. Edit `gatsby-config.js` to add the themes to the plugin array and to update the site metadata:

```javascript:title=gatsby-config.js
module.exports = {
  siteMetadata: {
    title: `Your Site Title`,
    description: `A description for your blazing fast site, using multiple themes!`,
    author: `Your name`,
    social: [
      {
        name: `Twitter`,
        url: `https://twitter.com/gatsbyjs`,
      },
      {
        name: `GitHub`,
        url: `https://github.com/gatsbyjs`,
      },
    ],
  },
  plugins: [
    {
      resolve: `gatsby-theme-blog`,
      options: {
        basePath: `/blog`,
      },
    },
    {
      resolve: `gatsby-theme-notes`,
      options: {
        basePath: `/notes`,
      },
    },
  ],
}
```

3. Run the site:

```shell
gatsby develop
```

4. Checkout `http://localhost:8000` to see what is currently there.

## Add content

Behind the scenes, the two themes created content folders in the root directory of the site. In this step, you will add some content to these folders.

### Add a post

Create a new file in `/content/posts`, like this one:

```mdx:title=content/posts/hello-posts.md
---
title: My first blog post
date: 2020-02-15
---

Multiple themes are great!
```

### Add a note

Create a new file in `/content/notes`, like this one:

```mdx:title=content/note/hello-notes.md
---
title: My first note
date: 2020-02-20
---

Multiple themes are awesome!
```

Restart your development server with `gatsby develop`. Now if you visit `http://localhost:8000/blog/hello-posts/` and `http://localhost:8000/notes/hello-notes` you should see your new content.

## Add an avatar image

Put an avatar image into the `content/assets/` directory, this is used by `gatsby-theme-blog` for the bio component. The file name can be `avatar.png` or `avatar.jpg`.

## Put the blog posts on the homepage

1. Delete the existing `src/pages/index.js` file.

2. Change the theme options for the blog theme in `gatsby-config.js`:

```javascript:title=gatsby-config.js
{
      resolve: `gatsby-theme-blog`,
      options: {
        // basePath defaults to `/` so this could also be included without options as just `gatsby-theme-blog`,
        basePath: `/`,
      },
    },
```

3. Restart your development server with `gatsby develop` to test your new homepage.

## Shadow components

Use [theme shadowing](/docs/themes/shadowing/) to customize components the theme provides for you.

### Shadow `bio-content.js`

The first component to update is `bio-content.js` which provides the content used in the `gatsby-theme-blog` `bio` component.

> 💡 Don't forget to stop and restart your development server when adding a shadowed component for the first time.

In order to shadow the file you need to place it in the same location it exists within the theme. In this case, that means `src/gatsby-theme-blog/components/bio-content.js`. So you'll create a file structure that looks look like this:

```text
└── src
    ├── gatsby-theme-blog
    │   ├── components
    │   │   ├── bio-content.js // highlight-line
```

Feel free to make the text of your bio anything you like, but the component will look something like this:

```jsx:title=src/gatsby-theme-blog/components/bio-content.js
import React, { Fragment } from "react"
import { Styled } from "theme-ui"

export default function BioContent() {
  return (
    <Fragment>
      Words by <Styled.a href="http://example.com/">Your Name</Styled.a>.
      <br />
      Change me. Your awesome bio, about how great you are!
    </Fragment>
  )
}
```

### Shadow Theme UI

`gatsby-theme-blog` and `gatsby-theme-notes` both use [Theme-UI](/docs/how-to/styling/theme-ui/) design tokens to manage their styling: colors, font sizes, spacing, etc. You can use component shadowing to gain control over these design tokens in the final site.

As with your bio, you need to match the file structure of the theme. In this case, that's `src/gatsby-plugin-theme-ui/index.js` and the resulting structure will look like this:

```text
└── src
    ├── gatsby-plugin-theme-ui
    │   ├── index.js //highlight-line
```

Feel free to use whatever colors you like, but here is an example of what you could do.

```javascript:title=src/gatsby-plugin-theme-ui/index.js
import merge from "deepmerge"
import defaultTheme from "gatsby-theme-blog/src/gatsby-plugin-theme-ui/index"

export default merge(defaultTheme, {
  colors: {
    background: "ghostwhite",
    text: "black",
    primary: "mediumvioletred",
    modes: {
      dark: {
        background: "indigo",
        text: "ghostwhite",
        primary: "gold",
      },
    },
  },
})
```

> Note that this example uses `deepmerge`. This allows you to use the Theme-UI configuration for any settings you don't override in this file.

## Add another theme

Themes can be big, like `gatsby-theme-blog`, but they can also be a small discrete set of components or functions. A great example of this is [gatsby-mdx-embed](https://gatsby-mdx-embed.netlify.app/) which adds the ability to embed social media content and videos directly into your MDX files.

1. Install the theme:

```shell
npm install @pauliescanlon/gatsby-mdx-embed
```

2. Update the `gatsby-config.js` file and add `gatsby-mdx-embed` as a plugin:

```javascript:title=gatsby-config.js
module.exports = {
  siteMetadata: {
    // ...siteMetadata is unchanged.
  },
  plugins: [
    `@pauliescanlon/gatsby-mdx-embed`, // highlight-line
    {
      resolve: `gatsby-theme-blog`,
      options: {
        basePath: `/`,
      },
    },
    {
      resolve: `gatsby-theme-notes`,
      options: {
        basePath: `/notes`,
      },
    },
  ],
}
```

3. Test it out by adding a YouTube video to one of your blog posts:

```mdx:title=content/posts/video-post.md
---
title: Jason and Jackson Talk Themes
date: 2020-02-21
---

Here is a video about composing and styling themes with J&J!

<YouTube youTubeId="6Z4p-qjnKCQ" />
```

## Add a navigation menu

Use component shadowing to add a navigation menu. You can read more about [creating dynamic navigation menus](/docs/creating-dynamic-navigation/) in the docs.

1. Add a `menuLinks` array to `gatsby-config.js`:

```javascript:title=gatsby-config.js
module.exports = {
  siteMetadata: {
    title: `Your Site Title`,
    description: `A description for your blazing fast site, using multiple themes!`,
    author: `Your name`,
    // highlight-start
    menuLinks: [
      {
        name: `Blog`,
        url: `/`,
      },
      {
        name: `Notes`,
        url: `/notes`,
      },
    ],
    // highlight-end
    social: [
      // ...social array is unchanged.
    ],
  },
  plugins: [
    // ...plugins array is unchanged.
  ],
}
```

2. Create the navigation component:

```jsx:title=src/components/navigation.js
import React from "react"
import { Link, useStaticQuery, graphql } from "gatsby"
import { Styled, css } from "theme-ui"

export default function Navigation() {
  const data = useStaticQuery(
    graphql`
      query SiteMetaData {
        site {
          siteMetadata {
            menuLinks {
              name
              url
            }
          }
        }
      }
    `
  )
  const navLinks = data.site.siteMetadata.menuLinks
  return (
    <nav
      css={css({
        py: 2, // Short form for paddingTop and paddingBottom
      })}
    >
      <ul
        css={css({
          display: `flex`,
          listStyle: `none`,
          margin: 0,
          padding: 0,
        })}
      >
        {navLinks.map(link => (
          <li
            css={css({
              marginRight: 2,
              ":last-of-type": {
                marginRight: 0,
              },
            })}
          >
            <Styled.a
              css={css({
                fontFamily: `heading`,
                fontWeight: `bold`,
                textDecoration: `none`,
                ":hover": {
                  textDecoration: `underline`,
                },
              })}
              as={Link}
              to={link.url}
            >
              {link.name}
            </Styled.a>
          </li>
        ))}
      </ul>
    </nav>
  )
}
```

3. When that is done the next step is to shadow `header.js` from `gatsby-theme-blog`. You can copy and paste code from the original component as a starting point for your new shadowed component.

Your file structure should look like this:

`src/gatsby-theme-blog/components/header.js`

```text
└── src
    ├── gatsby-theme-blog
    │   ├── components
    │   │   ├── header.js // highlight-line
```

4. Import the navigation menu and add it to the header:

> 💡 This code snippet is edited for length the [full component can be viewed on GitHub.](https://github.com/gatsbyjs/gatsby/tree/master/examples/using-multiple-themes/src/gatsby-theme-blog/components/header.js)

```jsx:title=src/gatsby-theme-blog/components/header.js
import React from "react"
import { css } from "theme-ui"
import Navigation from "../../components/navigation" // highlight-line

export default function Header() {
  return (
    <header>
      <div
        css={css({
          maxWidth: `container`,
          mx: `auto`,
          px: 3,
          pt: 4,
        })}
      >
        <Navigation /> // highlight-line
      </div>
    </header>
  )
}
```

5. Run `gatsby develop` and test the new navigation component.

## Wrapping up

This tutorial has introduced you to the idea of composing multiple themes together in a single Gatsby site. Gatsby Themes are an innovative rethink of the traditional website template and understanding their potential gives you a powerful new set of tools as a developer. To keep diving deeper, check out the [Gatsby Theme docs](/docs/themes/) and some of the other resources listed below.

## What's next?

- [Building a theme](/tutorial/building-a-theme/)

## Other resources

- [Using Multiple Themes Example Repo](https://github.com/gatsbyjs/gatsby/tree/master/examples/using-multiple-themes)
- [Gatsby Themes Reference Guide](/docs/themes/)
- [Egghead.io Course: Gatsby Theme Authoring (free)](https://egghead.io/courses/gatsby-theme-authoring)
- [IBM and Gatsby Themes: Driving Impact Through Design](https://www.youtube.com/watch?v=I2nh2juOKxM)
- [Setting up yarn workspaces for Gatsby theme development](/blog/2019-05-22-setting-up-yarn-workspaces-for-theme-development/#reach-skip-nav)
- [What is component shadowing?](/blog/2019-04-29-component-shadowing/)
- [Customizing styles in Gatsby Themes with Theme-UI](/blog/2019-07-03-customizing-styles-in-gatsby-themes-with-theme-ui/)
- [Composing and styling Gatsby Themes (with Brent Jackson) — Learn With Jason](https://www.youtube.com/watch?v=6Z4p-qjnKCQ)
- [Build a Personal Site Using Gatsby Themes (with Will Johnson) — Learn With Jason](https://www.youtube.com/watch?v=vf2Dy_xKUno)
