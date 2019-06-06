---
title: Porting Create React App to Gatsby
---

## What is Create React App?

Create React App is an officially supported solution from React to setup React apps, without having to deal with complicated configurations. It provides a default setup for tools like webpack and Babel that are useful in a modern development pipeline.

Gatsby offers some advantages like the ability to leverage Gatsby's ecosystem and performance optimizations. React's own [docs](https://reactjs.org/) run on Gatsby, and React [recommends Gatsby](https://github.com/facebook/create-react-app#popular-alternatives) to users of Create React App with more niche use cases like static sites!

---

## What do you get by changing to Gatsby?

Both Create React App and Gatsby use React and allow a faster setup, especially in setting up the initial configuration of a site, but their are substantial differences.

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

1. protecting any calls to browser based APIs

1. converting routes into pages in the `/pages` directory

The following sections

### Project Structure

To show some of the differences of how your project structure could differ by moving to Gatsby, a default Create React App project looks something like this:

```
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
├── .git
├── .gitignore
// highlight-start
├── .prettierrc
├── LICENSE
// highlight-end
├── README.md
// highlight-start
├── gatsby-browser.js
├── gatsby-config.js
├── gatsby-node.js
├── gatsby-ssr.js
// highlight-end
├── node_modules
├── package.json
// highlight-start
├── src
│   ├── components
│   ├── images
│   └── pages
// highlight-end
└── yarn.lock
```

The structure of a [Gatsby project](/docs/gatsby-project-structure/) adds some additional configuration files to hook into specific Gatsby APIs for the [browser](/docs/browser-apis/) and for [server-side rendering](/docs/ssr-apis/), though much of the project structure is similar enough to feel comfortable quickly.

An important difference to note is the `/pages` folder in the Gatsby project structure where components will automatically be turned into static pages by Gatsby. This is discussed more in the [routing](#routing) section below.

The `src/pages/index.js` file in Gatsby is a little different from the `src/index.js` file in Create React App where the root React element mounts, because it is a sibling to other pages in the app -- rather than a parent like Create React App. This means in order to share state or wrap multiple pages you should use the [wrapRootElement]() Gatsby API.

> **Note**: You could import your top level `App.js` in a file at `/src/pages/index.js` and your project will likely run with the `gatsby develop` command already, though you would lose many of the benefits like code splitting and server-side rendering that Gatsby uses for pages

### Server-side rendering and browser APIs

Understanding the distinction between the client (or browser) and server will help you understand one of the key differences between Create React App and Gatsby. Client-side and server-side describe where the code runs. Create React App by default sets up a project that will run in the browser. That means code is run in the context of the browser, a Create React App project hosted online will send the code to your browser, and your browser will connect to other APIs and decide how to display dynamic data.

On the other hand, a server-side rendered app will have the pages and dynamic data built out by the server, and then sent to a browser ready to go. Gatsby is server-side rendered at build time, meaning that the code that gets to your browser has already been run to produce an output,

_Check out Dustin Schau's [blog post about Gatsby internals](/blog/2019-04-02-behind-the-scenes-what-makes-gatsby-great/#server-side-rendering-ssr-at-build-time) that explains the technical aspects of the build process in greater detail_

List some common things that would need to be protected:

- localStorage
- window
- navigator
- packages like `react-router-dom`

The `gatsby build` command won't be able to use browser apis

### Routing

Gatsby will automatically turn files in the pages folder into static pages for you. relies on Reach Router for its routing.

Gatsby automatically turns files in the pages folder into routes, an advantage to having pages is a defined way of automatically code splitting. CRA requires you to use the `import()` syntax to assign what elements should be loaded dynamically,
Gatsby will create separate bundles for different pages for you

### Handling state

### Environment Variables

Uses `GATSBY_` prefix...

### Advanced customizations

Part of Gatsby's philosophy around tooling is [progressively disclosing complexity](/docs/gatsby-core-philosophy/#progressively-disclose-complexity), this simplifies the experience for a wider audience while still allowing the option to configure more advanced features for those that feel inclined. You won't have to "eject" your Gatsby app to edit more complex configurations.

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
