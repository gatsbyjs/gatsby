---
title: Using Multiple Themes Together
---

## What this tutorial covers

This tutorial covers how to compose multiple themes into a final site using [gatsby-theme-blog](/packages/gatsby-theme-blog/), [gatsby-theme-notes](/packages/gatsby-theme-notes/) and [gatsby-mdx-embed](/packages/@pauliescanlon/gatsby-mdx-embed/) as examples. It will also cover the concept of component shadowing with [Theme-UI](docs/theme-ui/) for styling.

## Prerequisites

This tutorial assumes the following:

- That you have an understanding of [Gatsby fundamentals](/tutorial/#gatsby-fundamentals)
- An existing knowledge of [Gatsby themes](/docs/themes/what-are-gatsby-themes/)

## Step 1: Create a new site using the hello world starter and change directory to "multiple-themes"

```shell
gatsby new multiple-themes https://github.com/gatsbyjs/gatsby-starter-hello-world
```

```shell
cd multiple-themes
```

## Step 2: Install and compose the themes

This step composes [gatsby-theme-blog](/packages/gatsby-theme-blog/) and [gatsby-theme-notes](/packages/gatsby-theme-notes/).

Install the themes:

```shell
npm install gatsby-theme-blog gatsby-theme-notes
```

Edit `gatsby-config.js` to add the themes to the plugin array and to update the site metadata:

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

## Step 3: Run the site

Next, run the site and see what you have:

```shell
cd multiple-themes
gatsby develop
```

## Step 4: Add content

Behind the scenes, the two themes created content folders in the root directory of the site. In this step, you will add some content to these folders.

Put an avatar image into `content/assets/` directory

Add at least one post and one note:

```mdx:title=content/posts/hello-posts.mdx
---
title: My first blog post
date: 2020-02-15
---

Multiple themes are great!
```

```mdx:title=content/note/hello-notes.mdx
---
title: My first note
date: 2020-02-20
---

Multiple themes are awesome!
```

Restart your development server:

```shell
# CTRl + C to stop the development server.
gatsby develop
```

Now if you visit `http://localhost:8001/blog/hello-posts/` and `http://localhost:8001/notes/hello-notes` you should see your content.

## Step 5: Put the blog posts on the homepage

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

## Step 6: Shadow the 'bio-content.js' component

It is possible to update the author bio information with a custom `bio-content.js` component using [theme shadowing](/docs/themes/shadowing/).

> Don't forget to stop and restart your development server when adding a shadowed component for the first time.

Your file structure should look like this:

```text
└── src
    ├── gatsby-theme-blog
    │   ├── components
    │   │   ├── bio-content.js // highlight-line
```

`src/gatsby-theme-blog/components/bio-content.js`

and your component could look like this:

```jsx:title=bio-content.js
import React, { Fragment } from "react"
import { Styled } from "theme-ui"

export default () => (
  <Fragment>
    Words by <Styled.a href="http://example.com/">Your Name</Styled.a>.
    <br />
    Change me. Your awesome bio, about how great you are!
  </Fragment>
)
```

## Step 7: Shadow the Theme-UI theme file

`gatsby-theme-blog` and `gatsby-theme-notes` both use [Theme-UI](/docs/theme-ui/) design tokens to manage their styling: colors, font sizes, spacing, etc. We can use component shadowing to gain control over these design tokens in the final site.

Your file structure should look like this:

```text
└── src
    ├── gatsby-plugin-theme-ui
    │   ├── index.js //highlight-line
```

`src/gatsby-plugin-theme-ui/index.js`
and your component could look like this:

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

## Step 8: Add another theme

Themes can be big, like `gatsby-theme-blog`, but they can also be a small discrete set of components or functions. A great example of this is [gatsby-mdx-embed](https://gatsby-mdx-embed.netlify.com/) which adds the ability to embed social media content and videos directly into your MDX files.

Install the theme:

```shell
npm install @pauliescanlon/gatsby-mdx-embed
```

Update the `gatsby-config.js` file and add `gatsby-mdx-embed` as a plugin:

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

Test it out by adding a Youtube video to one of your blog posts:

```mdx:title=content/posts/hello-posts.mdx
---
title: Jason and Jackson Talk Themes
date: 2020-02-21
---

Here is a video about composing and styling themes with J&J!

<YouTube youTubeId="6Z4p-qjnKCQ" />
```

## Step 9: Use component shadowing to add a navigation menu

Use component shadowing to add a navigation menu. You can read more about [creating dynamic navigation menus](/docs/creating-dynamic-navigation/) in the docs.

Add a `menuLinks` array to `gatsby-config.js`:

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
    // highlight-end
  },
  plugins: [
    `@pauliescanlon/gatsby-mdx-embed`,
    {
      resolve: `gatsby-theme-blog`,
      options: {
        // basePath defaults to `/`
        basePath: `/`,
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

Create the navigation component:

```jsx:title=src/components/navigation.js
import React from "react"
import { Link, useStaticQuery, graphql } from "gatsby"
import { Styled, css } from "theme-ui"

export default () => {
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

When that is done the next step would be to shadow `header.js` from `gatsby-theme-blog` by creating `src/gatsby-theme-blog/components/header.js` :

```text
└── src
    ├── gatsby-theme-blog
    │   ├── components
    │   │   ├── header.js // highlight-line
```

Import the navigation menu and add it to the header:

```jsx:title=header.js
import React from "react"
import { Link } from "gatsby"
import { css, useColorMode, Styled } from "theme-ui"
import Switch from "gatsby-theme-blog/src/components/switch"
import Bio from "gatsby-theme-blog/src/components/bio"
import sun from "gatsby-theme-blog/assets/sun.png"
import moon from "gatsby-theme-blog/assets/moon.png"
import Navigation from "../../components/navigation" // highlight-line

const rootPath = `${__PATH_PREFIX__}/`

const Title = ({ children, location }) => {
  if (location.pathname === rootPath) {
    return (
      <Styled.h1
        css={css({
          my: 0,
          fontSize: 4,
        })}
      >
        <Styled.a
          as={Link}
          css={css({
            color: `inherit`,
            boxShadow: `none`,
            textDecoration: `none`,
          })}
          to={`/`}
        >
          {children}
        </Styled.a>
      </Styled.h1>
    )
  } else {
    return (
      <Styled.h3
        as="p"
        css={css({
          my: 0,
        })}
      >
        <Styled.a
          as={Link}
          css={css({
            boxShadow: `none`,
            textDecoration: `none`,
            color: `primary`,
          })}
          to={`/`}
        >
          {children}
        </Styled.a>
      </Styled.h3>
    )
  }
}

const iconCss = [{ pointerEvents: `none`, margin: 4 }]

const checkedIcon = (
  <img
    alt="moon indicating dark mode"
    src={moon}
    width="16"
    height="16"
    role="presentation"
    css={iconCss}
  />
)

const uncheckedIcon = (
  <img
    alt="sun indicating light mode"
    src={sun}
    width="16"
    height="16"
    role="presentation"
    css={iconCss}
  />
)

export default ({ children, title, ...props }) => {
  const [colorMode, setColorMode] = useColorMode()
  const isDark = colorMode === `dark`
  const toggleColorMode = e => {
    setColorMode(isDark ? `light` : `dark`)
  }

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
        <div
          css={css({
            display: `flex`,
            justifyContent: `space-between`,
            alignItems: `center`,
            mb: 4,
          })}
        >
          <Title {...props}>{title}</Title>
          {children}
          <Switch
            aria-label="Toggle dark mode"
            checkedIcon={checkedIcon}
            uncheckedIcon={uncheckedIcon}
            checked={isDark}
            onChange={toggleColorMode}
          />
        </div>
        {props.location.pathname === rootPath && <Bio />}
      </div>
    </header>
  )
}
```

## What's next ?

- [Building a theme](/tutorial/building-a-theme/)

## Other resources

- [Gatsby Themes Reference Guide](/docs/themes/)
- [Egghead.io Course: Gatsby Theme Authoring (free)](https://egghead.io/courses/gatsby-theme-authoring)
- [Setting up yarn workspaces for Gatsby theme development](/blog/2019-05-22-setting-up-yarn-workspaces-for-theme-development/#reach-skip-nav)
- [What is component shadowing?](/blog/2019-04-29-component-shadowing/)
- [Customizing styles in Gatsby themes with Theme-UI](/blog/2019-07-03-customizing-styles-in-gatsby-themes-with-theme-ui/)
- [Composing and styling Gatsby themes (with Brent Jackson) — Learn With Jason](https://www.youtube.com/watch?v=6Z4p-qjnKCQ)
- [Build a Personal Site Using Gatsby Themes (with Will Johnson) — Learn With Jason](https://www.youtube.com/watch?v=vf2Dy_xKUno)
