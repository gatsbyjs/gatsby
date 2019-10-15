---
title: Adding React Components
---

This guide covers how to add React components to your Gatsby site.

## React components

React components are prebuilt elements or groups of elements that can be used to prevent repeating yourself in your code.

Components also offer the ability to be customized using "props" (properties). Props can be of any Javascript type, such as boolean, string, object, array or almost anything you can think of.

For example, you could use a component for Buttons on your site. This is because they would likely be used multiple times across pages and would need different labels each time.

## Importing React components

In Gatsby, when using React components, you import and use them just like you would in normal React:

```jsx
import React from "react"
import { Link } from "gatsby"

export default () => (
  <div>
    <Link to="/contact/">Contact</Link>
  </div>
)
```

## Things to watch out for

Since Gatsby uses Server Side Rendering (SSR) to generate your site's pages, the JSX code you write is usually compiled before the browser loads the page. Because of this, certain features are not available at compile time and can cause a build to error.

### Use of browser globals

Some components or code references on "browser globals" such as `window`, `document` or `localStorage`. This object is not available at compile time so can result in a Webpack error when building:

```
WebpackError: ReferenceError: window is not defined
```

#### Fixing your code

You can use conditionals to check that the browser global is defined in your code:

```js
if (typeof window !== "undefined") {
  // code that references the browser global
  window.alert("Woohoo!")
}
```

You can also drop the code that uses the browser global inside [`componentDidMount`](https://reactjs.org/docs/react-component.html#componentdidmount):

```jsx
import React, { useEffect } from "react"

export default () => {
  useEffect(() => {
    // code that references the browser global
    window.alert("Woohoo!")
  })

  return (
    <div>
      <p>Component</p>
    </div>
  )
}
```

...or you can use [a `useEffect` hook](https://reactjs.org/docs/hooks-reference.html#useeffect):

```jsx
import React, { Component } from "react"

class MyComponment() extends Component {
  componentDidMount() {
    // code that references the browser global
    window.alert("Woohoo!")
  }

  render() {
    return (
      <div>
        <p>Component</p>
      </div>
    )
  }
}
```

#### Fixing third-party modules

So, the worst has happened and you’re using an NPM module that expects `window` to be defined. You may be able to file an issue and get the module patched, but what to do in the mean time?

One solution is to [customize your webpack configuration](https://www.gatsbyjs.org/docs/add-custom-webpack-config) to replace the offending module with a dummy module during server rendering.

Edit `gatsby-node.js`

```js:title=gatsby-node.js
exports.onCreateWebpackConfig = ({ stage, loaders, actions }) => {
  if (stage === "build-html") {
    actions.setWebpackConfig({
      module: {
        rules: [
          {
            test: /bad-module/,
            use: loaders.null(),
          },
        ],
      },
    })
  }
}
```

Another solution is to use a package like [react-loadable](https://github.com/jamiebuilds/react-loadable). The module that tries to use `window` will be dynamically loaded only on the client side (and not during SSR).

### Components without server-side rendering

Server-side rendering means pages and content are built out by the server, and then sent to a browser ready to go. It’s like your pages are constructed before even being sent to the user. Gatsby is server-side rendered at build time, meaning that the code that gets to your browser has already been run to build pages and content, but this doesn’t mean you can’t still have dynamic pages.

Some React components don't have server-side rendering support (SSR) out-of-the-box so you might have to add SSR yourself.
