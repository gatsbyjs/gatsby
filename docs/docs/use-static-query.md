---
title: Querying Data in Components with the useStaticQuery hook
---

Gatsby v2.1.0 introduces `useStaticQuery`, a new [React Hook](https://reactjs.org/docs/hooks-intro.html) that. Just like the `StaticQuery` component, it allows your React components to retrieve data via a GraphQL query. But with the simplicity, shareability and elegance of Hooks.

In this guide, we'll walk through an example using `useStaticQuery`. If you're not familiar with static queries in Gatsby, you might want to check out [the difference between a static query and a page query](/docs/static-query/#how-staticquery-differs-from-page-query).

## How to use `useStaticQuery` in components

> 💡 You'll need React and ReactDOM 16.8.0 or later to use `useStaticQuery`.

`useStaticQuery` is a React Hook. All the [Rules of Hooks](https://reactjs.org/docs/hooks-rules.html) apply.

It takes your `query` and returns your data. That's it!

### Basic example

Let's create our familiar `Header` component:

```jsx:title=src/components/header.js
import React from "react"
import { useStaticQuery, graphql } from "gatsby"

export default () => {
  const data = useStaticQuery(graphql`
    query HeaderQuery {
      site {
        siteMetadata {
          title
        }
      }
    }
  `)

  return (
    <header>
      <h1>{data.site.siteMetadata.title}</h1>
    </header>
  )
}
```

## Known Limitations

- `useStaticQuery` does not accept variables (hence the name "static"), but can be used in _any_ component, including pages
- Because of how queries currently work in Gatsby, we support only a single instance of `useStaticQuery` in a file
