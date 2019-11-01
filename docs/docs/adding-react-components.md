---
title: Adding React Components
---

This guide covers how to add React components to your Gatsby site.

## React components

React components are prebuilt elements or groups of elements that can be used to split your User Interface (UI) into independent, reusable pieces. There are multiple types of components you can write: this guide covers functional components. For more in-depth information on writing React components including classes, check out the [React documentation](https://reactjs.org/docs/components-and-props.html).

Components also offer the ability to be customized using inputs, better known as "props" (properties). Props can be of any JavaScript type, such as Boolean, String, Object, Array or almost anything you can think of.

For example, you could use a component for Buttons on your site. This would enable them to be used multiple times across pages with different labels or actions each time.

## Importing React components

In Gatsby, when using React components, you can import and use them like you would in a React application. Here's an example of the [Gatsby Link](/docs/gatsby-link/) component in action, which brings with it extra functionality for performance:

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

Just like React, Gatsby also supports third-party components and libraries. You can install a third-party component or library via your package manager. We tend to favour and use npm and we will reflect this in our examples.

Here's an example of adding a third-party component to your site.

First, you have to install the component or library's package via a package manager. It's recommended not to mix package managers, so if you use npm, don't use another and vice versa.

```shell
npm install @material-ui/core
```

After you've installed a package, import and use it in your page's source:

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

Since Gatsby uses Server-Side Rendering (SSR) to generate your site's pages, the JSX code you write is usually compiled before the browser loads the page. Because of this, certain features are not available at compile time and can cause a build error.

### Use of browser globals

Some components or code reference browser globals such as `window`, `document` or `localStorage`. These objects are not available at [build](/docs/glossary#build) time and can result in a webpack error when compiling:

```
WebpackError: ReferenceError: window is not defined
```

To learn more about solutions for supporting SSR and client-side libraries, check out the related section on the [Porting from Create React App documentation](/docs/porting-from-create-react-app-to-gatsby#server-side-rendering-and-browser-apis).

#### Fixing third-party modules

Some packages expect `window` or another browser global to be defined. These packages will have to be patched.

You can learn how to patch these packages on the [Debugging HTML Builds documentation](docs/debugging-html-builds/#fixing-third-party-modules).

### Components without server-side rendering

Server-side rendering means pages and content are built out by the Node.js server and then sent to a browser ready to go. It’s like your pages are constructed before even being sent to the user. Gatsby is server-side rendered at build time, meaning that the code that gets to your browser has already been run to build pages and content, but this doesn’t mean you can’t still have dynamic pages.

Some React components don't have server-side rendering support (SSR) out-of-the-box so you might have to add SSR yourself.
