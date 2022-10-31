---
title: Using Partial Hydration
---

> Support for Gatsby's Partial Hydration was added in `gatsby@5.0.0` and is currently in **Beta**.

Partial Hydration enables you to selectively add interactivity to your otherwise completly static app. This results in improved frontend performance while keeping the benefits of client-side apps. Gatsby uses [React Server Components](https://github.com/reactjs/rfcs/blob/main/text/0188-server-components.md) to achieve this.

This guide will explain how you can use Partial Hydration, when and how to declare client components, and which current limitations exist.

We highly recommend reading the [Partial Hydration conceptual guide](/docs/conceptual/partial-hydration) to learn more about how Gatsby uses React Server Components.

## Prerequisites

- A Gatsby project set up with `gatsby@5.0.0` or later. (Need help creating one? Follow the [Quick Start](/docs/quick-start/))
- `react@experimental` and `react-dom@experimental` installed. You can install it like this:
  ```shell
  npm install --save-exact react@experimental react-dom@experimental
  ```
- Enable the `PARTIAL_HYDRATION` flag in `gatsby-config`:
  ```js:title=gatsby-config.js
  module.exports = {
    flags: {
      PARTIAL_HYDRATION: true
    }
  }
  ```

## Server Components

After enabling Partial Hydration all components are React Server Components **by default**. The generated HTML during `gatsby build` doesn't require any JavaScript on the client leading to improved performance out of the box. Gatsby starts generating server components from the top level pages (e.g. `src/pages` or via `createPage` API).

However, if you need interativity in your components you'll need to mark them as client components.

## Client components

In client components the generated HTML is [hydrated](/docs/glossary/hydration) on the client. Hydration is the process of using client-side JavaScript to add application state and interactivity to server-rendered HTML.

To define a component as a client component, you have to use the ["use client" directive](https://github.com/reactjs/rfcs/blob/main/text/0227-server-module-conventions.md) as the first line of code:

```jsx:title=src/components/joke.jsx
// highlight-next-line
"use client"

import * as React from "react"

const Joke = () => {
  const [isShown, show] = React.useReducer(() => true, false)

  return (
    <main>
      <button onClick={show}>Show me a joke</button>
      {isShown && <p>Why couldn’t the React component understand the joke? Because it didn’t get the context.</p>}
    </main>
  )
}

export default Joke
```

### When to use client components

We recommend using server components for everything and to only selectively define client components. There are cases where you need to use client components:

- Interactivity and event listeners (e.g. `onClick()`, `onChange()`, etc.)
- State and lifecycle methods (e.g. `useState()`, `useEffect()`, etc.)
- Browser-only APIs (e.g. accessing properties on `window`)
- React Class components

## FAQ

### Do I have to add "use client" to every interactive component?

No, you only have to add the directive to components that are imported into server components. Client components imported into other client components don't need the directive. As an example:

- You have an index page at `src/pages/index.jsx` that imports a `<SocialMedia>` component. `<SocialMedia>` itself imports an `<Instagram>` and `<Twitter>` component.
- By default every component is a server component, but `<SocialMedia>`, `<Instagram>`, and `<Twitter>` all use `useEffect()`.
- You only need to add the "use client" directive to the `<SocialMedia>` component

### How should I optimize my components composition?

When organizing your component structure, it's recommended to move your client components to the leaves of your component tree where possible. This way you can minimize the amount of JavaScript that is sent to the client.

Let's say you have a shared layout component that has an interactive footer to show your latest tweets. Instead of marking the layout component as interactive, you should place the footer into its own component and only mark that component as interactive.

```jsx:title=src/components/footer.jsx
"use client"

import * as React from "react"

const Footer = () => {
  React.useEffect(() => {
    // do fetching stuff
  })

  return (
    <footer>My Tweets</footer>
  )
}

export default Footer
```

```jsx:title=src/components/layout.jsx
import * as React from "react"
// Footer is a client component
import Footer from "./footer"

const Layout = ({ children }) => (
  <>
    <main>{children}</main>
    <Footer />
  </>
)

export default Layout
```

## Limitations

Please note these current limitations:

- The [Gatsby Slice API](/docs/reference/built-in-components/gatsby-slice/) and Partial Hydration are not compatible with each other. When using Partial Hydration you can't use Gatsby Slices and the other way around.
- You have to use React's experimental release which we **don't** recommend using in production
- A lot of packages in the React ecosystem are not ready for React Server Components (e.g. CSS-in-JS solutions)
- Partial Hydration only works during `gatsby build` & `gatsby serve`, and not `gatsby develop`

## Additional Resources

- [Partial Hydration Conceptual Guide](/docs/conceptual/partial-hydration)
- [RFC: React Server Components](https://github.com/reactjs/rfcs/blob/main/text/0188-server-components.md)
