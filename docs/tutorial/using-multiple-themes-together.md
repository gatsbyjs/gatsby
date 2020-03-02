---
title: Using Multiple Themes Together
---

## What this tutorial covers

This tutorial covers how to compose multiple themes into a final site using [gatsby-theme-blog](/packages/gatsby-theme-blog/), [gatsby-theme-notes](/packages/gatsby-theme-notes/) and [gatsby-mdx-embed](/packages/@pauliescanlon/gatsby-mdx-embed/) as examples. It will also cover the concept of component shadowing with relation to [Theme-UI](docs/theme-ui/) for styling 
- Component shadowing
- Component shadowing for Theme-UI theme file

## Prerequisites

- [Gatsby fundamentals](/tutorial/#gatsby-fundamentals)
- [What are Gatsby themes?](/docs/themes/what-are-gatsby-themes/)

## Step 1: Create a new site using the hello world starter

```shell
gatsby new multiple-themes https://github.com/gatsbyjs/gatsby-starter-hello-world
```

## Step 2: Install the themes

This step composes the [gatsby-theme-blog](/packages/gatsby-theme-blog/) and [gatsby-theme-notes](/packages/gatsby-theme-notes/) by running the command below: 


```shell
npm install gatsby-theme-blog gatsby-theme-notes
```

## Step 3: Update gatsby-config.js

The themes need to be added to the plugin array and the site metadata that comes with a starter should be renamed for personalization.

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

## Step 4: Run the site

Next, run the site and see what you have:

```shell
cd multiple-themes
gatsby develop
```

## Step 5: Add some content

Behind the scenes, the two themes created content folders in the root directory of the site. In this step, you will add some content to these folders.

Put an avatar image into `content/assets/avatar.png`

Add at least one post and one note:

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

Now if you visit `localhost:8000/blog` and `localhost:8000/notes` you should see some content to look at.

## Step 7: Put the blog posts on the homepage

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

Your name probably isn't Jane Doe. It is possible to update this information with a custom `bio-content.js` component using [theme shadowing](/docs/themes/shadowing/). 

> Don't forget to stop and restart your development server when adding a shadowed component for the first time. 

Your file structure should look like this:

```
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

`gatsby-theme-blog` and `gatsby-theme-notes` both use [Theme-UI](/docs/theme-ui/) design tokens to manage their styling; colors, font sizes, spacing, etc. We can use component shadowing to gain control over these design tokens in the final site. Don't forget to stop and restart your development server the again. Your file structure should look like this:

```
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

## Step 10: Add another theme

Themes can be big, like `gatsby-theme-blog`, but they can also be a small discrete set of components or functions. A great example of this is [gatsby-mdx-embed](https://gatsby-mdx-embed.netlify.com/) which adds the ability to embed social media content and videos directly into your MDX files.

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
title: Jason and Jackson Talk Themes
date: 2020-02-21
---

Here is a video about composing and styling themes with J&J!

<YouTube youTubeId="6Z4p-qjnKCQ" />
```

## Step 11: Add a navigation menu

Implementing component shadowing one more time to add a basic navigation menu can be an option. You can read more about [creating dynamic navigation menus](/docs/creating-dynamic-navigation/) in the docs.

Add a `menuLinks` array to `gatsby-config.js`

```javascript:title=gatsby-config.js
module.exports = {
  siteMetadata: {
    title: `Multiple Themes`,
    description: `A tutorial for building a Gatsby site using multiple themes.`,
    author: `Your name`,
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
        py: 2,
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

Shadow `header.js` from `gatsby-theme-blog`.

```
└── src
    ├── gatsby-theme-blog
    │   ├── components
    │   │   ├── bio-content.js // highlight-line
```

Import the navigation menu and add it to the header.

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

## What's next

- [Building a theme](/tutorial/building-a-theme/)

## Other resources

- [Egghead.io Course: Gatsby Theme Authoring (free)](https://egghead.io/courses/gatsby-theme-authoring)
- [Setting up yarn workspaces for Gatsby theme development](/blog/2019-05-22-setting-up-yarn-workspaces-for-theme-development/#reach-skip-nav)
- [What is component shadowing?](/blog/2019-04-29-component-shadowing/)
- [Customizing styles in Gatsby themes with Theme-UI](/blog/2019-07-03-customizing-styles-in-gatsby-themes-with-theme-ui/)
- [Composing and styling Gatsby themes (with Brent Jackson) — Learn With Jason](https://www.youtube.com/watch?v=6Z4p-qjnKCQ)
- [Build a Personal Site Using Gatsby Themes (with Will Johnson) — Learn With Jason](https://www.youtube.com/watch?v=vf2Dy_xKUno)
