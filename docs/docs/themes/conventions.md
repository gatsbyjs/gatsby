---
title: Themes Conventions
---

As we begin to formalize and standardize the methodologies for building Gatsby Themes, we're documenting them all here. These aren't intended to be the only way to solve things, but are recommended approaches. If you have other ideas and best practices please open up a PR to update this page.

## Table of Contents

- [Naming](#naming)
- [Initializing required directories](#initializing-required-directories)
- [Separating queries and presentational components](#separating-queries-and-presentational-components)
  - [Page queries](#page-queries)
  - [Static queries](#static-queries)
- [Site metadata](#site-metadata)

## Naming

It's recommended to prefix themes with `gatsby-theme-`. So if you'd like to name your theme "awesome" you
can name it `gatsby-theme-awesome` and place that as the `name` key in your `package.json`.

## Initializing Required Directories

If your theme relies on the presence of particular directories, like `posts` for `gatsby-source-filesystem`, you can use the `onPreBootstrap` hook to initialize them to avoid a crash when Gatsby tries to build the site.

```js:title=gatsby-node.js
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

## Separating Queries and Presentational Components

As a theme author, it's preferable to separate your data gathering and the components that render the data. This makes it easier for end users to be able to override a component like `PostList` or `AuthorCard` without having to write a [pageQuery](/docs/page-query) or [StaticQuery](/docs/static-query).

### Page Queries

You can use a template for top-level data collection with a page query that passes the data to a `PostList` component:

```js:title=src/templates/post-list.js
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

### Static Queries

You can use static queries at the top level template as well and pass the data to other presentational components as props:

```js:title=src/components/layout.js
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
      <main>{children}</main>
      <Footer {...social} />
    </>
  )
}

export default Layout
```

## Site Metadata

For commonly customized things, such as site title and social media handles, you
can have the user set site metadata in their `gatsby-config.js`. Then, throughout
your theme you can create a StaticQuery to access it:

```js:title=src/hooks/use-site-metadata.js
import { graphql, useStaticQuery } from "gatsby"

export default () => {
  const data = useStaticQuery(graphql`
    {
      site {
        siteMetadata {
          title
          social {
            twitter
            github
            instagram
          }
        }
      }
    }
  `)

  return data.site.siteMetadata
}
```

Then use it in components like the a header:

```js:title=src/components/header.js
import React from "react"
import { Link } from "gatsby"

import useSiteMetadata from "../hooks/use-site-metadata"

export default () => {
  const { title, social } = useSiteMetadata()

  return (
    <header>
      <Link to="/">{title}</Link>
      <nav>
        <a href={`https://twitter.com/${social.twitter}`}>Twitter</a>
        <a href={`https://github.com/${social.github}`}>GitHub</a>
        <a href={`https://instagram.com/${social.instagram}`}>Instagram</a>
      </nav>
    </header>
  )
}
```
