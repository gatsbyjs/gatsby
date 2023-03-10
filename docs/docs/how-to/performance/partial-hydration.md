---
title: Using Partial Hydration
---

> Support for Gatsby's Partial Hydration was added in `gatsby@5.0.0` and is currently in **Beta**.

Partial Hydration enables you to selectively add interactivity to your otherwise completly static app. This results in improved frontend performance while keeping the benefits of client-side apps. Gatsby uses [React server components](https://github.com/reactjs/rfcs/blob/main/text/0188-server-components.md) to achieve this.

This guide will explain how you can use Partial Hydration, when and how to declare client components, and which current limitations exist.

We highly recommend reading the [Partial Hydration conceptual guide](/docs/conceptual/partial-hydration) to learn more about how Gatsby uses React server components.

## Prerequisites

- A Gatsby project set up with `gatsby@5.0.0` or later. (Need help creating one? Follow the [Quick Start](/docs/quick-start/))
- `react@experimental` and `react-dom@experimental` installed. You can install it like this:
  ```shell
  npm install --save-exact react@experimental react-dom@experimental --legacy-peer-deps
  ```
- Enable the `PARTIAL_HYDRATION` flag in `gatsby-config`:
  ```js:title=gatsby-config.js
  module.exports = {
    flags: {
      PARTIAL_HYDRATION: true
    }
  }
  ```

## Server components

After enabling Partial Hydration all components are server components **by default**. The generated HTML during `gatsby build` doesn't require any JavaScript on the client leading to improved performance out of the box. Gatsby starts generating server components from the top level pages (e.g. `src/pages` or via `createPage` API).

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

No, you only have to add the “use client” directive to components that are imported into server components. This way you’re setting up a client boundary between server and client components. Therefore client components imported into other client components don’t need the directive. As an example:

- You have an index page at `src/pages/index.jsx` that imports a `<SocialMedia>` component. `<SocialMedia>` itself imports an `<Instagram>` and `<Twitter>` component.
- By default every component is a server component (as explained above). But `<SocialMedia>`, `<Instagram>`, and `<Twitter>` all use `useEffect()` so you'll need to mark a component as a client component.
- You only need to add the "use client" directive to the `<SocialMedia>` component since this is the only client component imported into a server component.

### How should I optimize my components tree?

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

### Can I import server components into client components?

No, you can't import a server component into a client component. But you can pass a server component as a `children` prop to a client component. This way React can instantiate both the client and server components.

Add a `children` prop to the client component that should contain the server component.

```jsx:title=client-component.jsx
"use client"

import * as React from "react"

export const MyClientComponent = ({ children }) => (
  <div>
    <p>Re-Hydrated on the client</p>
    {children}
  </div>
)
```

When using `ClientComponent`, now pass the server component as a `children` prop:

```jsx:title=src/pages/index.jsx
import * as React from "react"
import { MyServerComponent } from "../components/my-server-component"
import { MyClientComponent } from "../components/my-client-component"

const Page = () => (
  <MyClientComponent>
    <MyServerComponent />
  </MyClientComponent>
)

export default Page
```

### How can I pass props from server to client components?

For the most part, it's the same as in other parts of your app. However, when sending props from server to client components you need to make sure that the props are serializable. For example, functions or callbacks can't be passed.

```jsx
// OK
const Page = () => <ClientComponent color="rebeccapurple" />

// ⚠️ Doesn't work
const Page = () => (
  <ClientComponent onClick={() => console.log("Hello World")} />
)
```

## Limitations

Please note these current limitations:

- You have to use React's experimental release which we **don't** recommend using in production
- A lot of packages in the React ecosystem are not ready for React server components (e.g. CSS-in-JS solutions)
- Partial Hydration only works during `gatsby build` & `gatsby serve`, and not `gatsby develop`

## Additional Resources

- [Partial Hydration Conceptual Guide](/docs/conceptual/partial-hydration)
- [RFC: React Server Components](https://github.com/reactjs/rfcs/blob/main/text/0188-server-components.md)
