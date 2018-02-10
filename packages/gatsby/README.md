<img alt="Gatsby" src="https://www.gatsbyjs.org/monogram.svg" width="100">

# Gatsby

⚛️📄🚀 Blazing-fast static site generator for React

## Docs

**[View the docs on gatsbyjs.org](https://www.gatsbyjs.org/docs/)**

[Migrating from v0 to v1?](https://www.gatsbyjs.org/docs/migrating-from-v0-to-v1/)

[v0 docs](/v0-README.md)

## Link component

A `<Link>` component for Gatsby.

It's a wrapper around
[React Router's Link component](https://github.com/ReactTraining/react-router/blob/master/packages/react-router-dom/docs/api/Link.md)
that adds enhancements specific to Gatsby. All props are passed through to React
Router's Link.

You can set the `activeStyle` or `activeClassName` prop to add styling
attributes to the rendered element when it matches the current URL, and Gatsby
also supports React Router's props `exact`, `strict`, `isActive`, and
`location`. If any of these props are set, then
[React Router's NavLink component](https://github.com/ReactTraining/react-router/blob/master/packages/react-router-dom/docs/api/NavLink.md)
will be used instead of the default `Link`.

Gatsby does per-route code splitting. This means that when navigating to a new
page, the code chunks necessary for that page might not be loaded. This is bad.
Any unnecessary latency when changing pages should be avoided. So to avoid that
Gatsby preloads code chunks and page data.

Preloading is triggered by a link entering the viewport; Gatsby uses
`Link`/`NavLink`'s `innerRef` property to create a new InteractionObserver (on
supported browsers) to monitor visible links. This way, Gatsby only prefetches
code/data chunks for pages the user is likely to navigate to. You can also get
access to the link element by passing in a `innerRef` prop.

### Install

`npm install --save gatsby`

### How to use

In JavaScript:

```jsx
import { Link } from "gatsby"

render () {
  <div>
    <Link
      to="/another-page/"
      activeStyle={{
        color: 'red'
      }}
      innerRef={(el) => { this.myLink = el }}
    >
    Another page
    </Link>
  </div>
}
```

### Programmatic navigation

For cases when you can only use event handlers for navigation, you can use
`navigateTo`:

```jsx
import { navigateTo } from "gatsby"

render () {
  <div onClick={ () => navigateTo('/example')}>
    <p>Example</p>
  </div>
}
```

### Prefixed paths helper

Gatsby allows you to [automatically prefix links](/docs/path-prefix/) for sites
hosted on GitHub Pages or other places where your site isn't at the root of the
domain.

This can create problems during development as pathnames won't be prefixed. To
handle both, gatsby-link exports a helper function `withPrefix` that prepends
the prefix during production but doesn't in development.

This is only for pathnames you're constructing manually. The `<Link>` component
handles prefixing automatically.

```jsx
import { withPrefix } from "gatsbys";

const IndexLayout = ({ children, location }) => {
  const isHomepage = location.pathname === withPrefix("/");

  return (
    <div>
      <h1>Welcome {isHomepage ? "home" : "aboard"}!</h1>
      {children()}
    </div>
  );
};
```
