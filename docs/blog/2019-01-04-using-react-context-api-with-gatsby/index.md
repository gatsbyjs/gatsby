---
title: Using React Context API with Gatsby
author: Muhammad Muhsin
date: 2019-01-04
tags:
  - "React"
---

You often feel the unsettling flash of a bright phone screen while relaxing in a dimly lit room. The "dark mode" ends it, by switching background and foreground colors to reduce eye strain. I decided to add this to my boutique web agency [Laccadive IO's](https://laccadive.io/) new Gatsby-based site.

>
> One of the few types of alternative theme that adds real value to users is a low light intensity “night mode” theme. Not only is it easier on the eyes when reading in the dark, but it also reduces the likelihood of migraine and the irritation of other light sensitivity disorders. As a migraine sufferer, I’m interested!
>
> [Heydon Pickering](https://inclusive-components.design/a-theme-switcher/)

While discussing the different ways to implement this, I came up with React’s new Context API as a possible implementation strategy. Having worked with Context API before, I set to code. However, I soon realized you will not see a ‘root’ in a Gatsby app like an app built with Create React App.

After Googling a bit, I came across the Gatsby Browser APIs. Specifically, the [wrapRootElement](https://www.gatsbyjs.org/docs/browser-apis/#wrapRootElement) API was what I was looking for. This essentially allows you to wrap your root element with a Provider from Redux or Context for instance. Using this, I managed to achieve dark mode for Laccadive IO.

The following is a detailed instruction on how you too can achieve a similar result with Gatsby and React Context!

## Creating the Context file in a new Gatsby project

First of all, you have to initialize a Gatsby project and start it in develop mode.

1.   npm install –global gatsby-cli
2.  gatsby new gatsby-dark-mode
3.  cd gatsby-dark-mode
4.  gatsby develop

Then, create a `context` folder within src and the `ThemeContext.js` file within it.

```js:title=src/contex/ThemeContext.js
    import React from 'react'

    const defaultState = {
      dark: false,
      toggleDark: () => {},
    }

    const ThemeContext = React.createContext(defaultState)

    export default ThemeContext
```

`React.createContext` is a new function in React 16.3 and allows you to create a Context object. It accepts a default state, the value which will be used when a component does not have a matching Provider above it in the tree.  The function returns an object with Provider and Consumer properties which we will be using later.

## Modifying the Gatsby Browser file

Next, write the following code within the `gatsby-browser.js` file, which is in the root folder in a Gatsby project:
```jsx:title=gatsby-browser.js
    import React from 'react'

    import ThemeContext from './src/context/ThemeContext'

    class ThemeProvider extends React.Component {
      state = {
        dark: false,
      }

      toggleDark = () => {
        let dark = !this.state.dark
        localStorage.setItem('dark', JSON.stringify(dark))
        this.setState({ dark })
      }

      componentDidMount() {
        this.setState({ dark: JSON.parse(localStorage.getItem('dark')) })
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
// highlight-start
    export const wrapRootElement = ({ element }) => (
      <ThemeProvider>{element}</ThemeProvider>
    )
// highlight-end
```
Create the `ThemeProvider` component which wraps its' children with `TemeContext.Provider`. This component then wraps the root element and is exported as `wrapRootElement`.

The `toggleDark` function gets the current `state.dark` value and switches the value to the opposite. It then stores the new value in `localStorage` before setting it back to state using the `setState` function, so that it persists over page refreshes. The dark value from `state` and the `togglDark` function are passed to the Provider.

## Editing the Layout file

The default `layout.js` uses a `<staticQuery>` and renderProp to render the layout, which is wrapped by a Fragment `<>`. Modify it to look like this:
```jsx:title=src/components/layout.js
    import React from 'react'
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
          // highlight-start
          <ThemeContext.Consumer>
            {theme => (
              <div className={theme.dark ? 'dark' : 'light'}>
          // highlight-end
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

Basically the class of the wrapper div will change based on the context value of the dark variable, which we set as state in the `ThemeContext.js` file.

## Adding the switch in the Header

Having done the configuration, let’s add the actual switch to turn on/off the dark mode. Please modify the `header.js` code to look like this:
```jsx:title=src/components/header.js
    import { Link } from 'gatsby'
    import PropTypes from 'prop-types'
    import React from 'react'

    import ThemeContext from '../context/ThemeContext'

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
                {theme.dark ? (
                  <span>Light mode &#9728;</span>
                ) : (
                  <span>Dark mode &#9790;</span>
                )}
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

All of this will not work if the styles are not in place. Therefore, add the following styles in the `layout.css` file:

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

That was it for adding dark mode using React’s Context API in Gatsby. Now if you visit `http://localhost:8000/` you can see the code in action.

We covered the following in today’s article:

*   Introduction to dark mode in web development
*   Initializing a Gatsby project
*   Initializing the context object with `createContext`
*   Using the Gatsby Browser API and returning `wrapRootElement` from `gatsby-browser.js`
*   Wrapping the JSX within `layout.js` with a Context Consumer and a div with class referring to the dark mode state
*   Adding the switch inside the header
*   Adding the styles relevant to the Dark mode

Would you like to see the action for yourself? Head over to https://github.com/m-muhsin/gatsby-dark-mode and clone or fork my project. 

