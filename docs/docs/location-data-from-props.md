---
title: Location Data from Props
---

## What is location data

Sometimes it can be helpful to know exactly what your app's browser URL is at any given stage. Because Gatsby uses [@reach/router](https://github.com/reach/router) for [client-side](/docs/glossary#client-side) routing, the `location` prop is passed to any page component and represents where the app is currently, where you'd like it to go, and other helpful information. The `location` object is never mutated but `reach@router` makes it helpful to determine when navigation happens. Here is a sample `props.location`:

```js
{
  key: 'ac3df4', // does not populate with a HashHistory!
  pathname: '/somepage',
  search: '?someurlparam=valuestring1&anotherurlparam=valuestring2',
  hash: '#about',
  state: {
    [userDefined]: true
  }
}
```

Note that you have to parse the `search` field (the [query string](https://developer.mozilla.org/en-US/docs/Web/API/URL/search)) into individual keys and values yourself.

### HashHistory

Using `hash` in JavaScript is one way to update the browser URL and the DOM without having the browser do a full HTML page reload. HashHistory in `@reach/router` is used to track browser history with JavaScript when using [hashrouter](https://reacttraining.com/react-router/web/api/HashRouter) instead of [browserrouter](https://reacttraining.com/react-router/web/api/BrowserRouter) which uses the newer HTML5 `history` API.

### Getting the absolute URL of a page

The `location` object's properties generally do not include the domain of your site, since Gatsby doesn't know where you will deploy it.

Running [client side](/docs/glossary#client-side) is the exception to this rule. In this case, all the information your browser exposes as `window.location` is available. This includes `href` for the absolute URL of the page, including the domain.

Sometimes you need the absolute URL of the current page (including the host name) while using [server-side rendering](/docs/glossary#server-side-rendering/). For example, you may want to add a canonical URL to the page header.

In this case, you would first need to add configuration that describes where your site is deployed. You can add this as a `siteURL` property on `siteMetadata` in [`gatsby-config.js`](/docs/reference/config-files/gatsby-config/).

Once you have added `siteURL`, you can form the absolute URL of the current page by retrieving `siteURL` and concatenating it with the current path from `location`. Note that the path starts with a slash; `siteURL` must therefore not end in one.

```jsx:title=src/pages/some-page.js
import React from "react"
import { graphql } from "gatsby"

const Page = ({ location, data }) => {
  const canonicalUrl = data.site.siteMetadata.siteURL + location.pathname

  return <div>The URL of this page is {canonicalUrl}</div>
}

export default Page

export const query = graphql`
  query PageQuery {
    site {
      siteMetadata {
        siteURL
      }
    }
  }
`
```

## Use cases

Through client-side routing in Gatsby you can provide a location object instead of strings, which are helpful in a number of situations:

- Providing state to linked components
- Client-only routes
- Fetching data
- Animation transitions

## Example of providing state to a link component

```jsx:title=index.js
// usually you'd do this
<Link to="/somepagecomponent"/>

// but if you want to add some additional state
<Link
  to={'/somepagecomponent'}
  state={{modal: true}}
/>
```

Then from the receiving component you can conditionally render markup based on the `location` state.

```jsx:title=some-page-component.js
const SomePageComponent = ({ location }) => {
  const { state = {} } = location
  const { modal } = state
  return modal ? (
    <dialog className="modal">I'm a modal of Some Page Component!</dialog>
  ) : (
    <div>Welcome to the Some Page Component!</div>
  )
}
```

## Other resources

- [Gatsby Link API](/docs/reference/built-in-components/gatsby-link/)
- [@reach/router docs](https://reach.tech/router/api/Location)
- [react-router location docs](https://github.com/ReactTraining/react-router/blob/master/packages/react-router/docs/api/location.md)
- [Hash Router](https://reacttraining.com/react-router/web/api/HashRouter)
- [Gatsby Breadcrumb Plugin](/plugins/gatsby-plugin-breadcrumb/#breadcrumb-props)
- [Create Modal w/ Navigation State using React Router](https://codedaily.io/tutorials/47/Create-a-Modal-Route-with-Link-and-Nav-State-in-React-Router)
