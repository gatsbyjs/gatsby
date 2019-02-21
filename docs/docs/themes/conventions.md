---
title: Themes Conventions
---

> ⚠⚠ Gatsby Themes are currently experimental ⚠⚠

As we begin to formalize and standardize the methodologies for building Gatsby Themes, we're documenting them all here. These aren't intended to be the only way to solve things, but are recommended approaches. If you have other ideas and best practices please open up a PR to update this page.

## Table of contents

- [Initializing required directories](#initializing-required-directories)
- [Separating queries and presentational components](#separating-queries-and-presentational-components)
  - [Page queries](#page-queries)
  - [Static queries](#static-queries)
- [Site metadata](#site-metadata)
- [Design tokens](#design-tokens)
- [Templates vs components](#templates-vs-components)
- [Frontmatter placeholder](#frontmatter-placeholder)

## Initializing required directories

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

## Separating queries and presentational components

As a theme author, it's preferable to separate your data gathering and the components that render the data. This makes it easier for end users to be able to override a component like `PostList` or `AuthorCard` without having to write a [pageQuery](/docs/page-query) or [StaticQuery](/docs/static-query).

### Page queries

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

### Static queries

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

## Site metadata

## Design tokens

## Templates vs components

## Frontmatter placeholder

**Note**: This is only needed temporarily. In the future themes will be able to set frontmatter schema.
