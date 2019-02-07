---
title: Gatsby Link & navigate
---

 For internal navigation, Gatsby includes a built-in `<Link>` component as well as a `navigate` function, for dynamic navigation.

 Gatsby's `<Link>` component enables linking to internal pages as well as a powerful performance feature called preloading. Preloading is used to prefetch resources so that they're ready incredibly fast when a user performs a navigation.

Gatsby's `<Link>` is a wrapper around [@reach/router's Link component](https://reach.tech/router/api/Link) that adds enhancements specific to Gatsby. All props are passed through to @reach/router's `Link` component.

## Using Link

In JavaScript:

```jsx
import React from "react"
import { Link } from "gatsby"

class Page extends React.Component {
  render() {
    return (
      <div>
        <Link
          to="/another-page/"
          activeStyle={{
            color: "red",
          }}
          innerRef={el => {
            this.myLink = el
          }}
          state={{
            pleasant: "reasonably",
          }}
        >
          Another page
        </Link>
      </div>
    )
  }
}
```

## Using navigate()
Sometimes you need to navigate to pages programatically:

```jsx
import { navigate } from "gatsby"

render () {
  return (
    <div onClick={ () => navigate('/example')} role="link" tabIndex="0" onKeyUp={this.handleKeyUp}>
      <p>Example</p>
    </div>
  )
}
```

The `navigate` function accepts two parameters (see following sections):
 * a string representing the destination
 * optional settings object. The settings object can include two optional properties: `state (object)`, and `replace (bool, default false)`.

Note that `navigate` was previously named `navigateTo`. `navigateTo` is deprecated in Gatsby v2.

## Pushing versus Replacing history entry
By default, both `<Link>` and `navigate` will _push_ a new entry to the history stack.

This can be changed by passing a `replace` prop to the Link component, or by passing `replace: true` to the `navigate` settings object. 

When replace is enabled, clicking the browser back button will return the user to the page _preceeding the page from which they navigated_.

```jsx
import { Link } from 'gatsby'

render () {
  return (
    <Link
      to="/another-page/"
      replace
    >
      Go and prevent back to bring you back here
    </Link>
  )
}
```

Using `replace` also won't scroll the page after navigation.

## Passing state through Link and Navigate

You can pass state to pages when you navigate, such as:

```javascript
navigate(`/a-path/`, { state: { pleasant: `reasonably` }}
```

You can also pass state to pages when you use `Link`:

```jsx
<Link
  to="/another-page/"
  activeStyle={{
    color: "red",
  }}
  state={{
    pleasant: "reasonably",
  }}
>
```

This is accessible from the `location` object on the new page:

```javascript
componentDidMount() {
  const pleasant = this.props.location.state.pleasant
  this.setState({
    pleasant: pleasant
  })
}
```
## Styling
You can set the `activeStyle` or `activeClassName` prop to add styling
attributes to the rendered element when it matches the current URL.

## Prefixed paths helper

It is common to host sites in a sub-directory of a site. Gatsby lets you [set
the path prefix for your site](/docs/path-prefix/). After doing so, Gatsby's `<Link>` component will automatically handle constructing the correct URL in development and production.

For pathnames you construct manually, there's a helper function, `withPrefix` that prepends your path prefix in production (but doesn't during development where paths don't need prefixed).

```jsx
import { withPrefix } from "gatsby"

const IndexLayout = ({ children, location }) => {
  const isHomepage = location.pathname === withPrefix("/")

  return (
    <div>
      <h1>Welcome {isHomepage ? "home" : "aboard"}!</h1>
      {children}
    </div>
  )
}
```

## Use `<Link>` only for internal links!

This component is intended _only_ for links to pages handled by Gatsby. For links to pages on other domains or pages on the same domain not handled by the current Gatsby site, use the normal `<a>` element.

Sometimes you won't know ahead of time whether a link will be internal or not,
such as when the data is coming from a CMS.
In these cases you may find it useful to make a component which inspects the
link and renders either with Gatsby's `<Link>` or with a regular `<a>` tag
accordingly.

Since deciding whether a link is internal or not depends on the site in
question, you may need to customize the heuristic to your environment, but the
following may be a good starting point:

```jsx
import { Link as GatsbyLink } from "gatsby"

// Since DOM elements <a> cannot receive activeClassName,
// destructure the prop here and pass it only to GatsbyLink
const Link = ({ children, to, activeClassName, ...other }) => {
  // Tailor the following test to your environment.
  // This example assumes that any internal link (intended for Gatsby)
  // will start with exactly one slash, and that anything else is external.
  const internal = /^\/(?!\/)/.test(to)

  // Use Gatsby Link for internal links, and <a> for others
  if (internal) {
    return (
      <GatsbyLink to={to} activeClassName={activeClassName} {...other}>
        {children}
      </GatsbyLink>
    )
  }
  return (
    <a href={to} {...other}>
      {children}
    </a>
  )
}

export default Link
```

### File Downloads

You can similarly check for file downloads:

```jsx
  const file = /\.[0-9a-z]+$/i.test(to)

  ...

  if (internal) {
    if (file) {
        return (
          <a href={to} {...other}>
            {children}
          </a>
      )
    }
    return (
      <GatsbyLink to={to} {...other}>
        {children}
      </GatsbyLink>
    )
  }
```
