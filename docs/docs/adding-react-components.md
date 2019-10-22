---
title: Adding React Components
---

This guide covers how to add React components to your Gatsby site.

## React components

React components are prebuilt elements or groups of elements that can be used to split your User Interface (UI) into independent, reusable pieces.

Components also offer the ability to be customized using inputs, better known as "props" (properties). Props can be of any JavaScript type, such as Boolean, String, Object, Array or almost anything you can think of.

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

### Importing third-party components

Just like React, Gatsby also supports third-party components and libraries. You can install a third-party component or library via your package manager (either `yarn` or `npm`).

Here's a short example on adding a third-party component to your site.

First, you have to install the component or library's package via a package manager. It's recommended not to mix package managers (don't use npm and yarn at the same time).

```shell
// Install material-ui with npm
npm install @material-ui/core

// Or with yarn
yarn add @material-ui/core
```

After, import and use it in your page's source:

```jsx:title=my-page.jsx
import React from "react"

// import my fancy third-party component
import Button from "@material-ui/core/Button"

export default () => (
  <div>
    <p>This is my super awesome page made with Gatsby!</p>

    {/* use my fancy third-party component */}
    <Button>Fancy button!</Button>
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

There's a great section on fixing these issues on the [Porting from Create React App](/docs/porting-from-create-react-app-to-gatsby#server-side-rendering-and-browser-apis) page.

#### Fixing third-party modules

Some packages expect `window` or another browser global to be defined. These packages will have to be patched.

You can learn how to patch these packages on the [Debugging HTML Builds](docs/debugging-html-builds/#fixing-third-party-modules) page.

### Components without server-side rendering

Server-side rendering means pages and content are built out by the server, and then sent to a browser ready to go. It’s like your pages are constructed before even being sent to the user. Gatsby is server-side rendered at build time, meaning that the code that gets to your browser has already been run to build pages and content, but this doesn’t mean you can’t still have dynamic pages.

Some React components don't have server-side rendering support (SSR) out-of-the-box so you might have to add SSR yourself.
