---
title: Themes API Reference
---

Themes are packaged Gatsby sites, so you have access to all of Gatsby's APIs.

- [Gatsby Config](https://www.gatsbyjs.org/docs/gatsby-config/)
- [Actions](https://www.gatsbyjs.org/docs/actions/)
- [Node Interface](https://www.gatsbyjs.org/docs/node-interface/)
- ... [and more](https://www.gatsbyjs.org/docs/api-specification/)

## Table of contents

Themes also have some unique APIs and considerations to be made when building your own.

- [Configuration](#configuration)
- [Component shadowing](#component-shadowing)
- [Theme composition](#theme-composition)
- [Add theme transpilation](#add-theme-transpilation)
- [Conventions](#conventions)
  - [Initializing required directories](#initializing-required-directories)
  - [Separating queries and presentational components](#separating-queries-and-presentational-components)
    - [Page queries](#page-queries)
    - [Static queries](#static-queries)
  - [Site metadata](#site-metadata)
  - [Design tokens](#design-tokens)
  - [Templates vs components](#templates-vs-components)
  - [Frontmatter placeholder](#frontmatter-placeholder)

## Configuration

Similarly to plugins, you can access options that are passed to your theme.
You can use this to allow make filesystem sourcing configurable, accepting different nav menu items, or change branding colors from the default.

```js:title=gatsby-config.js
module.exports = {
  __experimentalThemes: [
    {
      resolve: "gatsby-theme-name",
      options: {
        postsPath: "/blog",
        colors: {
          primary: "tomato",
        },
      },
    },
  ],
}
```

In your theme's `gatsby-config.js` you can return a function, the argument it receives are the options:

```js:title=gatsby-config.js
module.exports = themeOptions => {
  console.log(themeOptions)

  return {
    plugins: [
      // ...
    ],
  }
}
```

Then, in your theme's `gatsby-node.js` you can access them as the second argument:

```js:title=gatsby-node.js
exports.createPages = async ({ graphql, actions }, themeOptions) => {
  console.log(themeOptions)
}
```

## Component Shadowing

Gatsby Themes allow you to customize any file in a theme's `src` directory by following a file naming convention.
If you're using `gatsby-theme-tomato` which uses a `ProfileCard` component located at `src/components/ProfileCard.js` you can override the component by creating `src/gatsby-theme-tomato/components/profile-card.js`. If you want to see what props are passed you can do so by putting the props into a `pre` tag:

```js:title=src/gatsby-theme-tomato/components/profile-card.js
import React from "react"

export default props => <pre>{JSON.stringify(props, null, 2)}</pre>
```

## Theme composition

TODO

## Add theme transpilation

**Note**: This is only needed temporarily. Themes will automatically be transpiled in later versions.

Since your theme will be installed, it will end up in `node_modules` which Gatsby doesn't transpile by default.
This is something you can achieve with `gatsby-plugin-compile-es6-packages`.

You will need to install the package:

```sh
yarn add gatsby-plugin-compile-es6-packages
```

And then add it to your plugins list:

```js:title=gatsby-config.js
const path = require("path")

module.exports = {
  plugins: [
    {
      resolve: "gatsby-plugin-page-creator",
      options: {
        path: path.join(__dirname, "src", "pages"),
      },
    },
    {
      resolve: "gatsby-plugin-compile-es6-packages",
      options: {
        modules: ["gatsby-theme-developer"],
      },
    },
  ],
}
```

## Conventions

### Initializing required directories

If your theme relies on the presence of particular directories, like `posts` for `gatsby-source-filesystem`, you can use the `onPreBootstrap` hook to initialize them to avoid a crash when Gatsby tries to build the site.

```js:gatsby-node.js
exports.onPreBootstrap = ({ store, reporter }) => {
  const { program } = store.getState()

  const dirs = [
    path.join(program.directory, "posts"),
    path.join(program.directory, "src/pages"),
    path.join(program.directory, "src/data"),
  ]

  dirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      reporter.log(`creating the ${dir} directory`)
      mkdirp.sync(dir)
    }
  })
}
```

### Separating queries and presentational components

As a theme author, it's preferable to separate your data gathering and the components that render the data. This makes it easier for end users to be able to override a component like `PostList` or `AuthorCard` without having to write a [pageQuery](/docs/page-query) or [StaticQuery](/docs/static-query).

#### Page queries

You can use a template for top-level data collection with a page query that passes the data to a `PostList` component:

```js:src/templates/post-list.js
import React from "react"
import { graphql } from "gatsby"

import PostList from "../components/PostList"

export default props => <PostList posts={props.allMdx.edges} />

export const query = graphql`
  query {
    allMdx(
      sort: { order: DESC, fields: [frontmatter___date] }
      filter: { frontmatter: { draft: { ne: true } } }
    ) {
      edges {
        node {
          id
          parent {
            ... on File {
              name
              sourceInstanceName
            }
          }
          frontmatter {
            title
            path
            date(formatString: "MMMM DD, YYYY")
          }
        }
      }
    }
  }
`
```

#### Static queries

You can use static queries at the top level template as well and pass the data to other presentational components as props:

```js:src/components/layout.js
import React from "react"
import { useStaticQuery, graphql } from "gatsby"

import Header from "../header.js"
import Footer from "../footer.js"

const Layout = ({ children }) => {
  const {
    site: { siteMetadata },
  } = useStaticQuery(
    graphql`
      query {
        site {
          siteMetadata {
            title
            social {
              twitter
              github
            }
          }
        }
      }
    `
  )

  const { title, social } = siteMetadata

  return (
    <>
      <Header title={title} />
      {children}
      <Footer {...social} />
    </>
  )
}

export default Layout
```

### Site metadata

### Design tokens

### Templates vs components

### Frontmatter placeholder

**Note**: This is only needed temporarily. In the future themes will be able to set frontmatter schema.
