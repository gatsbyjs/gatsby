---
title: Porting Create React App to Gatsby
---

## What is Create React App?

Create React App is an officially supported tool from React to setup React apps, without having to deal with complicated configurations. It provides a default setup for tools like webpack and Babel that are useful in a modern development pipeline.

Gatsby is similar in that it can also help you setup an app and removes much of the configuration headache, but offers some additional advantages like the ability to leverage Gatsby's ecosystem and performance optimizations. React's own [docs](https://reactjs.org/) run on Gatsby, and React even [recommends Gatsby](https://github.com/facebook/create-react-app#popular-alternatives) to users of Create React App!

---

## What do you get by changing to Gatsby?

Both Create React App and Gatsby use React and allow a faster setup, especially in setting up the initial configuration of a site, but their are differences.

### Performance optimizations

A lot of automatic optimization upgrades like automatic code splitting and preloading of data come out of the box with Gatsby to improve site speed and performance audit scores. There are improvements like progressive web app support that are part of both projects, but Gatsby offers even more specific performance optimizations.

A few examples:

- `gatsby-link` uses an [Intersection Observer to preload linked pages](/blog/2019-04-02-behind-the-scenes-what-makes-gatsby-great/#intersectionobserver) when they appear in the viewport, making them feel like they load _instantly_
- `gatsby-image` will create optimized versions of your images in different sizes, loading a lighter version of an image and replacing it with a higher res version when loading has finished, check out [the demo](https://using-gatsby-image.gatsbyjs.org/) to see for yourself

These and more work together to make your Gatsby site fast by default.

### Expansive ecosystem

Gatsby still works with all the `react` packages running in a Create React App project, but adds the ability to leverage [hundreds of other Gatsby plugins](/plugins) to drop in additional features for things like adding SEO, responsive images, RSS feeds, or much more.

### Unified GraphQL data layer

Plugins can also pull in data from any number of sources like APIs, CMSes, or the filesysten. That data is combined into a unified data layer that you can query with GraphQL throughout your app.

This data layer simplifies the process of pulling data from different sources and providing them in your pages and components.

> **Note**: GraphQL isn't required for managing data in a Gatsby app, feel free to look over the guide on [using Gatsby without GraphQL](/docs/using-gatsby-without-graphql/) as well

---

## What changes need to be made?

In order to transition your codebase over to using Gatsby, a few things need to be taken care of to account for the differences between how the projects are set up.

In order to use Gatsby, you have to install it:

```shell
npm install --save gatsby
```

> **Note**: rather than using the `gatsby new` command like you would initializing a new Gatsby site, this will install Gatsby as a dependency in your project

After installation, the key things that need to change are:

1. protecting any calls to browser based APIs (if there are any)

1. converting routes into pages in the `/pages` directory

The following sections explain the above steps as well as other changes that you might need to make depending on the complexity of your app. A default Create React App project is able to run with just the above steps ([see an example](https://twitter.com/gill_kyle/status/1136666618224730112)).

### Project Structure

To show some of the differences of how your project structure could differ by moving to Gatsby, a default Create React App project looks something like this:

```diff
  my-create-react-app
  ├── .git
  ├── .gitignore
  ├── README.md
  ├── node_modules
  ├── package.json
  ├── src
  │   ├── App.css
  │   ├── App.js
  │   ├── App.test.js
  │   ├── index.css
  │   ├── index.js
  │   ├── logo.svg
  │   └── serviceWorker.js
  └── yarn.lock
```

Whereas a default Gatsby project will look something like this, files that are different between Create React App and Gatsby are highlighted):

```diff
  my-gatsby-site
  ├── .git
  ├── .gitignore
+ ├── .prettierrc
+ ├── LICENSE
  ├── README.md
+ ├── gatsby-browser.js
+ ├── gatsby-config.js
+ ├── gatsby-node.js
+ ├── gatsby-ssr.js
  ├── node_modules
  ├── package.json
  ├── src
+ │   ├── components
+ │   ├── images
+ │   └── pages
  └── yarn.lock
```

The structure of a [Gatsby project](/docs/gatsby-project-structure/) adds some additional configuration files to hook into specific Gatsby APIs for the [browser](/docs/browser-apis/) and for [server-side rendering](/docs/ssr-apis/), though much of the project structure is similar enough to feel comfortable quickly.

An important difference to note is the `/pages` folder in the Gatsby project structure where components will automatically be turned into static pages by Gatsby. This is discussed more in the [routing](#routing) section below.

The `src/pages/index.js` file in Gatsby is a little different from the `src/index.js` file in Create React App where the root React element mounts, because it is a sibling to other pages in the app -- rather than a parent like Create React App. This means in order to share state or wrap multiple pages you should use the [wrapRootElement]() Gatsby API.

> **Note**: You could import your top level `App.js` in a file at `/src/pages/index.js` and your project will likely run with the `gatsby develop` command already, though you would lose many of the benefits like code splitting and server-side rendering that Gatsby uses for pages

### Server-side rendering and browser APIs

Server-side rendering means pages and dynamic data are built out by the server, and then sent to a browser ready to go. It's like your page is loaded before even being sent to the user. Gatsby is server-side rendered at build time, meaning that the code that gets to your browser has already been run to build pages and content, but this doesn't mean you can't still have dynamic pages.

Understanding the distinction between the client (or browser) and server will help you understand that key difference between Create React App and Gatsby. Create React App doesn't by default render your components with server-side rendering APIs when it is built like Gatsby does.

_Check out Dustin Schau's [blog post about Gatsby internals](/blog/2019-04-02-behind-the-scenes-what-makes-gatsby-great/#server-side-rendering-ssr-at-build-time) that explains the technical aspects of the build process in greater detail_

The `gatsby build` command won't be able to use browser APIs so some code would cause your build to break if it isn't protected.

Some common APIs that would need to be protected are:

- `window`
- `localStorage`
- `navigator`
- packages like `react-router-dom`

These are only a few examples, though all can be fixed in one of two ways:

1. wrapping the code in an `if` to check if whatever you are referencing is defined so builds won't try to reference something undefined and the browser will be able to deal with it fine:

```jsx
if (typeof window !== `undefined`) {
  // code using window like window.location...
}
```

2. moving references to them into a `componentDidMount` or `useEffect` hook:

```jsx
import React from "react"

const Foo = () => {
  window.alert("This will break the build")
  return <span>Bar</span>
}

export default Foo
```

Would be changed to:

```jsx
import React from "react"

const Foo = () => {
  React.useEffect(() => {
    window.alert("This won't break the build")
  })
  return <span>Bar</span>
}

export default Foo
```

For more information about errors encountered during builds, see the doc on [debugging HTML builds](/docs/debugging-html-builds/)

### Routing

There are two possibilites of routes that you can setup: static and dynamic. A static route has content that doesn't change, whereas a dynamic route can [fetch data at runtime](/docs/client-data-fetching/) just like any other React app.

Gatsby automatically turns React components in the pages folder into static routes.

> **Note**: An advantage to having pages in separate files like this is a defined way of [automatically code splitting](/docs/how-code-splitting-works/), whereas Create React App requires you to use the `import()` syntax to assign what elements should be loaded dynamically

For dynamic routes, you should implement routing with [@reach/router](https://reach.tech/router), which is already included with Gatsby. Dynamic routes can be implemented the same way you would implement a router in Create React App (or any other React application). However, because these routes won't be represented as HTML files in the final build, if you want users to be able to visit the routes directly (like entering the URL in the search bar), you'll need to generate pages in the `gatsby-node.js` file which is demonstrated in the [Building Apps with Gatsby](/docs/building-apps-with-gatsby/) guide.

```jsx
import React from "react"
import { Router } from "@reach/router"

const App = () => (
  <Router>
    <Route path="/user/" component={Users} />
    <Route path="/user/:id" component={UserDetails} />
  </Router>
)

export default App
```

Gatsby provides a `<Link />` component and a `navigate` function to help you direct users through pages on your site. You can read about how to use each in the [`gatsby-link` doc](/docs/gatsby-link/).

### Handling state

Because Gatsby rehydrates into a regular React app, state can be handled inside of components in the same way it would in Create React App. If you use a another library for state management and want to wrap your app in some sort of global state the section on [context providers](#context-providers) will be helpful.

### Environment Variables

Create React App requires you to create environment variables prefixed with `REACT_APP_`. Gatsby instead uses the `GATSBY_` prefix to [make environment variables accessible](/docs/environment-variables) in the browser context.

```title=".env"
# in Create React App
REACT_APP_API_URL=http://someapi.com

# in Gatsby
GATSBY_API_URL=http://someapi.com
```

### Advanced customizations

Part of Gatsby's philosophy around tooling is [progressively disclosing complexity](/docs/gatsby-core-philosophy/#progressively-disclose-complexity), this simplifies the experience for a wider audience while still allowing the option to configure more advanced features for those that feel inclined. You won't have to "eject" your Gatsby app to edit more complex configurations.

In terms of levels of abstraction, Gatsby allows you to move up or down to tap into more sophisticated, and lower-level APIs without needing to eject like you would in Create React App.

#### webpack

Create React App will require you to eject or rely on another workaround to edit the webpack configuration. Gatsby allows [custom configuration of webpack](/docs/add-custom-webpack-config/) via the `gatsby-node.js` file.

#### Context providers

React's context API allows you to share state from a higher component and distribute it to components below it in the component tree without having to deal with issues like prop drilling (link?)

How do you share state across components like a theme without one top level `App.js` file? Gatsby has a wrapRootElement and a wrapPageElement API that allow you to wrap the root element or all pages of your Gatsby site with components you want.

In Create React App it could look like this:

```jsx:title="create-react-app/src/App.js"
import React from "react"

const defaultTheme = "light"
const ThemeContext = React.createContext(defaultTheme)

function App() {
  return (
    <ThemeContext.Provider value={defaultTheme}>
      {/* App, routing, and other components */}
    </ThemeContext.Provider>
  )
}

export default App
```

In Gatsby, if you want your providers to be global across pages you would move those providers to `gatsby-browser.js`:

```jsx:title="gatsby/gatsby-browser.js"
import React from "react"

const defaultTheme = "light"
export const ThemeContext = React.createContext(defaultTheme)

export const wrapRootElement = ({ element }) => {
  return (
    <ThemeContext.Provider value={defaultTheme}>
      {element}
    </ThemeContext.Provider>
  )
}
```
