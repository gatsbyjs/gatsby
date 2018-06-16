---
title: "Querying data in non-page components using StaticQuery"
---

Gatsby v2 introduces `StaticQuery`, a new API that allows non-page components to retrieve data via GraphQL query.

## Basic example

```jsx
import React from "react"
import { StaticQuery } from "gatsby"

const Header = () => (
  <StaticQuery
    query={graphql`
      query HeaderQuery {
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
      query HeaderQuery {
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

## How it differs from page query

StaticQuery can do most of the things that page query can, including fragments.

You can’t, however, pass **Query Variables** to `StaticQuery`, like you can in page queries through `pageContext`.
