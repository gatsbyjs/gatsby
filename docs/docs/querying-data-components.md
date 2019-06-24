---
title: Use StaticQuery and useStaticQuery hook in non-page components
---

## StaticQuery

`StaticQuery` lets you query data from non-page components.

### Usage

The `StaticQuery` component has two props : `query` and `render` that you must provide.

```jsx:title=src/components/NonPageComponent.js
import React from "react"
import { StaticQuery, graphql } from "gatsby"

const NonPageComponent = () => (
  <StaticQuery
    query={graphql`
      query NonPageQuery {
        site {
          siteMetadata {
            title
          }
        }
      }
    `}
    render={data => (
      <h1>
        Querying title from NonPageComponent with StaticQuery:
        {data.site.siteMetadata.title}
      </h1>
    )}
  />
)

export default NonPageComponent
```

This component can be used as you normally would any other component.

## The useStaticQuery hook

Since Gatsby v2.1.0 you can use `useStaticQuery` to query data.

The `useStaticQuery` is a React Hook. All the [Rules of Hooks](https://reactjs.org/docs/hooks-rules.html) apply.

It takes your GraphQL query and returns the requested data.

### Requirements

You'll need React and ReactDOM 16.8.0 or later to use `useStaticQuery`.

`yarn add react@^16.8.0 react-dom@^16.8.0`

### Usage

Let's refactor the previous example to use `useStaticQuery`.

Import `useStaticQuery` and `graphql` from `gatsby` in order to use query the data.

```jsx:title=src/components/NonPageComponent.js
import React from "react"
import { useStaticQuery, graphql } from "gatsby"

const NonPageComponent = () => {
  const data = useStaticQuery(graphql`
    query NonPageQuery {
      site {
        siteMetadata {
          title
        }
      }
    }
  `)
  return (
    <h1>
      Querying title from NonPageComponent: {data.site.siteMetadata.title}
    </h1>
  )
}

export default NonPageComponent
```

## Additional resources

- [More on Static Query for querying data in components](/docs/static-query/)
- [The difference between a static query and a page query](/docs/static-query/#how-staticquery-differs-from-page-query)
- [More on the useStaticQuery hook](/docs/use-static-query/)
