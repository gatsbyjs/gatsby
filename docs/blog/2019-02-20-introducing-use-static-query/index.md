---
title: Introducing useStaticQuery
date: 2019-02-20
author: Sidhartha Chatterjee
tags: ["releases"]
---

React Hooks are _cool_. Besides simplifying your code and removing the need for a lot of boilerplate associated with classes in JavaScript (looking at you, `this`), they enable some serious shareability. They also make it possible to use state in functional components.

You can probably tell that we've been super excited about [React Hooks][hooks-intro]. So when they finally landed in React 16.8, we figured it was time to give our very own `StaticQuery` component the hook treatment!

### Say hello to useStaticQuery

`useStaticQuery` is a hook that takes a GraphQL query and returns your data. That's it.

**No more Render Props necessary to use a Static Query**

This simplifies accessing data in your components and also keeps your component tree shallow.

Let's quickly check out a basic example. Here's a typical Header component, first written using `StaticQuery` and then `useStaticQuery`.

### Before

```jsx
import React from "react"
import { StaticQuery, graphql } from "gatsby"

const Header = () => {
  return (
    // highlight-next-line
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
      // highlight-next-line
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
  // highlight-next-line
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
    // highlight-next-line
    <header>
      <h1>{site.siteMetadata.title}</h1>
    </header>
  )
}

export default Header
```

Isn't that cleaner and more succinct?

Just like `StaticQuery`, when you build your site for production, Gatsby will parse _and_ execute your queries in `useStaticQuery` and inject data in just the right place.

Where this gets even more powerful is the ability to create custom hooks that use `useStaticQuery` in them. Let's say you need to query for the site title several times in your app. Instead of a call to `useStaticQuery` in each component, you can extract it out to a custom hook like:

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

Now every time you need the site title, you can use this custom hook.

```jsx
const Header = () => {
  // highlight-next-line
  const { title } = useSiteMetadata()

  return (
    <header>
      <h1>{title}</h1>
    </header>
  )
}
```

Isn't that neat?

![excited-gif](./images/excited.gif)

And if there's a change to the structure of that data, you only need to change the query in one place!

We're really excited about this pattern and everything it enables. With our upcoming [themes][themes] feature, a theme could even export custom hooks of its own. Users could access data using these without writing a single query.

# Where can I get this?

https://twitter.com/jacobimpson/status/1095930703504584706

The astute reader (Jacob is astute, be like Jacob) would've noticed that we _stealthily_ released `useStaticQuery` last week.

To use `useStaticQuery`, update `gatsby` to v2.1.0 and `react` and `react-dom` to v16.8.0!

```shell
npm install gatsby react react-dom
```

# Known Limitations

Because of the way queries are currently parsed in Gatsby, `useStaticQuery` has one small limitation at the moment. You can only use one instance of `useStaticQuery` in a file. That's it! This doesn't mean your app can't have multiple uses, but rather that a single JavaScript file can only have one instance of `useStaticQuery`.

We're working on fixing this soon.

# Next Steps

- Check out the [documentation][use-static-query]
- To see `useStaticQuery` in action (and for a really gentle introduction to Hooks in general), check out the [livestream][use-static-query-livestream] Jason Lengstorf and I did last week
- Hit [me][sidhartha-twitter] up on Twitter for any questions!

We hope you enjoy using `useStaticQuery` in your Gatsby apps. Happy building!

[use-static-query]: /docs/use-static-query/
[use-static-query-livestream]: https://www.youtube.com/watch?v=asrdFuAxPaU&list=PLz8Iz-Fnk_eTpvd49Sa77NiF8Uqq5Iykx
[sidhartha-twitter]: https://twitter.com/chatsidhartha
[rules-of-hooks]: https://reactjs.org/docs/hooks-rules.html
[hooks-intro]: https://reactjs.org/docs/hooks-intro.html
[themes]: /blog/2019-02-11-gatsby-themes-livestream-and-example/
