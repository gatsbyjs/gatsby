---
title: Using React Context API with Gatsby
author: Muhammad Muhsin
date: 2019-01-31
tags:
  - "react"
---

You often feel the unsettling flash of a bright phone screen while relaxing in a dimly lit room. This is alleviated by introducing a "dark mode" which switches background and foreground colors to reduce eye strain. I decided to add this to my boutique web agency [Laccadive IO's](https://laccadive.io/) new Gatsby-based site.

<Pullquote citation="Heydon Pickering">
  One of the few types of alternative theme that adds real value to users is a
  low light intensity “night mode” theme. Not only is it easier on the eyes when
  reading in the dark, but it also reduces the likelihood of migraine and the
  irritation of other light sensitivity disorders. As a migraine sufferer, I’m
  interested!
</Pullquote>

In considering the different ways to implement this a natural fit become apparent: React’s new Context API. Having worked with Context API before, this seemed like a particularly well suited use for this API. However, I soon realized I would need to do a little set-up work to get this up and running.

After a brief search, I came across just what I was looking for, the Gatsby Browser APIs. Specifically, the [`wrapRootElement`](/docs/browser-apis/#wrapRootElement) API was a perfect fit for this use case. This API allows you to wrap your root element with a wrapping component, e.g. a `Provider` from Redux or... a ThemeProvider from React Context. Using this, I managed to achieve dark mode for my use case.

Let's do a deep dive into how this feature was actually implemented step by step using React Context, Gatsby, and a Theme Provider to implement a dark mode UI!

## Creating the Context file in a new Gatsby project

First of all, you have to initialize a Gatsby project and start it in develop mode.

1. gatsby new gatsby-dark-mode
1. cd gatsby-dark-mode
1. npm start

Then, create a `context` folder within src and the `ThemeContext.js` file within it.

```jsx:title=src/context/ThemeContext.js
import React from "react"

const defaultState = {
  dark: false,
  toggleDark: () => {},
}

const ThemeContext = React.createContext(defaultState)

// Getting dark mode information from OS!
// You need macOS Mojave + Safari Technology Preview Release 68 to test this currently.
const supportsDarkMode = () =>
  window.matchMedia("(prefers-color-scheme: dark)").matches === true

class ThemeProvider extends React.Component {
  state = {
    dark: false,
  }

  toggleDark = () => {
    let dark = !this.state.dark
    localStorage.setItem("dark", JSON.stringify(dark))
    this.setState({ dark })
  }

  componentDidMount() {
    // Getting dark mode value from localStorage!
    const lsDark = JSON.parse(localStorage.getItem("dark"))
    if (lsDark) {
      this.setState({ dark: lsDark })
    } else if (supportsDarkMode()) {
      this.setState({ dark: true })
    }
  }

  render() {
    const { children } = this.props
    const { dark } = this.state
    return (
      <ThemeContext.Provider
        value={{
          dark,
          toggleDark: this.toggleDark,
        }}
      >
        {children}
      </ThemeContext.Provider>
    )
  }
}

export default ThemeContext

export { ThemeProvider }
```

[`React.createContext`](https://reactjs.org/docs/context.html#reactcreatecontext) is a new function in React 16.3 and allows you to create a Context object. It accepts a default state, the value which will be used when a component does not have a matching Provider above it in the tree.  The function returns an object with Provider and Consumer properties which we will be using later.

Create the `ThemeProvider` component which wraps its children with `ThemeContext.Provider`. This component is exported as a named export from the file.

The `toggleDark` function gets the current `state.dark` value and switches the value to the opposite. It then stores the new value in `localStorage` before setting it back to state using the `setState` function, so that it persists over page refreshes. The dark value from `state` and the `toggleDark` function are passed to the Provider.

## Modifying the Gatsby Browser file

Next, write the following code within the `gatsby-browser.js` file, which is in the root folder in a Gatsby project:

```jsx:title=gatsby-browser.js
import React from "react"

import { ThemeProvider } from "./src/context/ThemeContext"

// highlight-start
export const wrapRootElement = ({ element }) => (
  <ThemeProvider>{element}</ThemeProvider>
)
// highlight-end
```

The `ThemeProvider` component exported from the `ThemeContext.js` file wraps the root element and is exported as `wrapRootElement`. This API is then invoked appropriately by the Gatsby API runner.

## Editing the Layout file

The default `layout.js` uses a `<staticQuery>` and renderProp to render the layout, which is wrapped by a Fragment `<>`. Modify it to look like this:

```jsx:title=src/components/layout.js
import * as React from 'react'
import PropTypes from 'prop-types'
import { StaticQuery, graphql } from 'gatsby'

import ThemeContext from '../context/ThemeContext'
import Header from './header'
import './layout.css'

const Layout = ({ children }) => (
  <StaticQuery
    query={graphql`
      query SiteTitleQuery {
        site {
          siteMetadata {
            title
          }
        }
      }
    `}
    render={data => (
      {/* highlight-start */}
      <ThemeContext.Consumer>
        {theme => (
          <div className={theme.dark ? 'dark' : 'light'}>
      {/* highlight-end */}
            <Header siteTitle={data.site.siteMetadata.title} />
            <div
              style={{
                margin: `0 auto`,
                maxWidth: 960,
                padding: `0px 1.0875rem 1.45rem`,
                paddingTop: 0,
              }}
            >
              {children}
              <footer>
                © {new Date().getFullYear()}, Built with
                {` `}
                <a href="https://www.gatsbyjs.org">Gatsby</a>
              </footer>
            </div>
          </div>
        )}
      </ThemeContext.Consumer>
    )}
  />
)

Layout.propTypes = {
  children: PropTypes.node.isRequired,
}

export default Layout
```

The class of the wrapper div will change based on the context value of the dark variable, which we set as state in the `ThemeContext.js` file.

## Adding the switch in the Header

With this configuration completed, we can now add the actual switch to toggle dark mode. Modify the `header.js` component, like so:

```jsx:title=src/components/header.js
import { Link } from "gatsby"
import PropTypes from "prop-types"
import React from "react"

import ThemeContext from "../context/ThemeContext"

const Header = ({ siteTitle }) => (
  <ThemeContext.Consumer>
    {theme => (
      <div
        style={{
          background: `rebeccapurple`,
          marginBottom: `1.45rem`,
        }}
      >
        <div
          style={{
            margin: `0 auto`,
            maxWidth: 960,
            padding: `1.45rem 1.0875rem`,
          }}
        >
          <h1 style={{ margin: 0 }}>
            <Link
              to="/"
              style={{
                color: `white`,
                textDecoration: `none`,
              }}
            >
              {siteTitle}
            </Link>
          </h1>
          <button className="dark-switcher" onClick={theme.toggleDark}>
            {theme.dark ? <span>Light mode ☀</span> : <span>Dark mode ☾</span>}
          </button>
        </div>
      </div>
    )}
  </ThemeContext.Consumer>
)

Header.propTypes = {
  siteTitle: PropTypes.string,
}

Header.defaultProps = {
  siteTitle: ``,
}

export default Header
```

## Adding styles

At this point, we've set up a dark mode toggle and conditionally render a `className` if dark mode is enabled. However, we still need to actually _style_ based upon this conditional `className`. As such, we need to add the following styles in the `layout.css` file:

```css:title=src/components/layout.css
/* Dark mode styles */
.dark-switcher {
  color: #fff;
  margin-top: 5px;
  background: transparent;
  border: none;
  cursor: pointer;
}

@media (min-width: 992px) {
  .dark-switcher {
    position: absolute;
    right: 15px;
    top: 10px;
  }
}

.dark {
  background-color: #2a2b2d;
  color: #fff;
  transition: all 0.6s ease;
}

.light {
  transition: all 0.6s ease;
  background-color: #fefefe;
}

.dark a,
.dark a:visited {
  color: #fff;
}
```

## Conclusion

In just a few, simple steps we've enabled a conditional dark mode that our users will certainly appreciate. We've leveraged APIs like `Context` in React, as well as internal Gatsby APIs to wrap our code with a provider. Now if you visit `http://localhost:8000/` you can see all of our work pay off!

We covered the following in today’s article:

- Introduction to dark mode in web development
- Initializing a Gatsby project
- Initializing the context object with `createContext`
- Using the Gatsby Browser API and returning `wrapRootElement` from `gatsby-browser.js`
- Wrapping the JSX within `layout.js` with a Context Consumer and a div with class referring to the dark mode state
- Adding the switch inside the header
- Adding the styles relevant to the Dark mode

Interested in seeing this in action? Head over to https://github.com/m-muhsin/gatsby-dark-mode and clone or fork my project.
