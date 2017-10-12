# gatsby-link

A `<Link>` component for Gatsby.

It's a wrapper around [React Router's Link component](https://github.com/ReactTraining/react-router/blob/master/packages/react-router-dom/docs/api/Link.md) that adds enhancements specific to Gatsby. All props are passed through
to React Router's Link.

You can set the `activeStyle` or `activeClassName` prop to add styling attributes to the rendered element when it matches the current URL. If either of these props are set, then [React Router's NavLink component](https://github.com/ReactTraining/react-router/blob/master/packages/react-router-dom/docs/api/NavLink.md) will be used instead of Link.

Gatsby does per-route code splitting. This means that when navigating to a new
page, the code chunks necessary for that page might not be loaded. This is bad.
Any unnecessary latency when changing pages should be avoided. So to avoid that
Gatsby preloads code chunks and page data. Preloading is triggered by a link
entering the viewport so it only prefetchs code/data chunks for pages the user
is likely to navigate to.

## Install

`npm install --save gatsby-link`

## How to use

In javascript:

```jsx
import Link from "gatsby-link"

render () {
  <div>
    <Link
      to="/another-page/"
      activeStyle={{
        color: 'red'
      }}
    >
    Another page
    </Link>
  </div>
}
```

## Programmatic navigation

For cases when you can only use event handlers for navigation, you can use `navigateTo`:

```jsx
import { navigateTo } from "gatsby-link"

render () {
  <div onClick={ () => navigateTo('/example')}>
    <p>Example</p>
  </div>
}
```
