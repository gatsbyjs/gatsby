---
title: Introducing useStaticQuery
date: 2019-02-15
author: Sidhartha Chatterjee
tags:
  - hooks
  - static query
---

We've been _super_ excited about [React Hooks][hooks-intro] for a while and when they finally landed last week in React 16.8, we figured it was time to give our very own `StaticQuery` component the hook treatment.

We'd like to introduce our first hook, `useStaticQuery`.

`useStaticQuery` is a hook that takes a GraphQL query and returns your data. That's it!

**No more Render Props necessary. Not only does this simplify accessing your data in components now but will also keep your component tree shallow!**

> 💡 To use useStaticQuery, you'll need to update `gatsby` to v2.1.0 and `react` and `react-dom` to v16.8.0

Let's check out a simple example. Here's a simple Header component, first using `StaticQuery` and then with `useStaticQuery`.

### Before

```jsx
import React from "react"
import { StaticQuery, graphql } from "gatsby"

const Header = () => {
  return (
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
}

export default Header
```

### After

```jsx
import React from "react"
import { useStaticQuery, graphql } from "gatsby"

const Header = () => {
  const { site } = useStaticQuery(
    graphql`
      query {
        site {
          siteMetadata {
            title
          }
        }
      }
    `
  )

  return (
    <header>
      <h1>{site.siteMetadata.title}</h1>
    </header>
  )
}

export default Header
```

![excited-gif](./images/excited.gif)

Isn't that cleaner and more succinct?

Just like `StaticQuery`, when you build your site for production, Gatsby will parse _and_ execute your queries in `useStaticQuery` and inject data in just the right place!

You can even create custom hooks that use `useStaticQuery` in them. All the [rules of hooks][rules-of-hooks] apply.

```jsx
const useSiteMetadata = () => {
  const { site } = useStaticQuery(
    graphql`
      query {
        site {
          siteMetadata {
            title
          }
        }
      }
    `
  )
  return site.siteMetadata
}
```

# Known Limitations

Because of the way queries are currently parsed in Gatsby, `useStaticQuery` has one small limitation at the moment. You can only use one instance of `useStaticQuery` in a file. That's it! This doesn't mean your app can't have multiple uses. Just that a single JavaScript source file can have one instance of it.

We're working on fixing this soon.

# Next Steps

- Check out the [documentation][use-static-query]
- For a practical introduction (and a really gentle introduction to Hooks), check out the [livestream][use-static-query-livestream] Jason Lengstorf and I did yesterday
- Hit [me][sidhartha-twitter] up on Twitter for any questions!

We hope you enjoy using `useStaticQuery` in your Gatsby apps to query your data!

[use-static-query]: /docs/use-static-query/
[use-static-query-livestream]: https://www.youtube.com/watch?v=asrdFuAxPaU&list=PLz8Iz-Fnk_eTpvd49Sa77NiF8Uqq5Iykx
[sidhartha-twitter]: https://twitter.com/chatsidhartha
[rules-of-hooks]: https://reactjs.org/docs/hooks-rules.html
[hooks-intro]: https://reactjs.org/docs/hooks-intro.html
