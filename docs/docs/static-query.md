---
title: "Querying data in components using StaticQuery"
---

Gatsby v2 introduces `StaticQuery`, a new API that allows components to retrieve data via GraphQL query.

## Basic example

We'll create a new `Header` component located at `src/components/header.js`:

```jsx
import React from "react"
import { StaticQuery, graphql } from "gatsby"

const Header = () => (
  <StaticQuery
    query={graphql`
      query {
        site {
          siteMetadata {
            title
          }
        }
      }
    `}
    render={data => (
      <header>
        <h1>{data.site.siteMetadata.title}</h1>
      </header>
    )}
  />
)

export default Header
```

Using `StaticQuery`, you can colocate a component with its data. No longer is it required to, say, pass data down from `Layout` to `Header`.

## Typechecking

With the above pattern, you lose the ability to typecheck with PropTypes. To regain typechecking while achieving the same result, you can change the component to:

```jsx
import React from "react"
import { StaticQuery } from "gatsby"
import PropTypes from "prop-types"

const Header = ({ data }) => (
  <header>
    <h1>{data.site.siteMetadata.title}</h1>
  </header>
)

export default props => (
  <StaticQuery
    query={graphql`
      query {
        site {
          siteMetadata {
            title
          }
        }
      }
    `}
    render={data => <Header data={data} {...props} />}
  />
)

Header.propTypes = {
  data: PropTypes.shape({
    site: PropTypes.shape({
      siteMetadata: PropTypes.shape({
        title: PropTypes.string.isRequired,
      }).isRequired,
    }).isRequired,
  }).isRequired,
}
```

## How StaticQuery differs from page query

StaticQuery can do most of the things that page query can, including fragments. The main difference are:

- `StaticQuery` can be used anywhere inside your source code including page components.
- `StaticQuery` can't use **Query Variables**, like you can in page queries through `pageContext`.
- page queries are only available on page components.
- page queries have access to the pageContext.
