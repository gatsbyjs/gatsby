---
title: "Location Data from Props"
---

## What is location data

Sometimes it can be helpful to know exactly what your app's browser URL is at any given stage. Using [@reach/router](https://github.com/reach/router) for [client-side](/docs/glossary#client-side) routing in Gatsby, `location` data represents where the app is currently, where you'd like it to go, and other helpful information. The `location` object is never mutated but `reach@router` makes it helpful to determine when navigation happens.

```js
{
  key: 'ac3df4', // does not populate with a HashHistory!
  pathname: '/somepage',
  search: '?someurlquery=searching-string',
  hash: '#about',
  state: {
    [userDefined]: true
  }
}
```

### HashHistory

Using `hash` in JavaScript is one way to update the browser URL and the DOM without having the browser do a full HTML page reload. HashHistory in `@reach/router` is used to track browser history with JavaScript when using [hashrouter](https://reacttraining.com/react-router/web/api/HashRouter) instead of [browserrouter](https://reacttraining.com/react-router/web/api/BrowserRouter) which uses the newer HTML5 `history` API.

## Use cases

Through client-side routing in Gatsby you can provide a location object instead of strings, which are helpful in a number of situations:

- Providing state to linked components
- Client-only routes
- Fetching Data
- Animation Transition

## Example of providing state to a link component

```js:title=index.js
// usually you'd do this
<Link to="/somepagecomponent"/>

// but if you want to add some additional state
<Link to={{
  pathname: '/somepagecomponent',
  state: {modal: true}
}}>
```

Then from the receiving component you can conditionally render markup based on the `location` state.

```js:title=some-page-component.js
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

## Gatsby advantages

The great thing is you can expect the `location` prop to be available to you on every page thanks to its use of `@reach/router`.

## Other resources

- [@reach/router docs](https://reach.tech/router/api/Location)
- [react-router location docs](https://github.com/ReactTraining/react-router/blob/master/packages/react-router/docs/api/location.md)
- [Hash Router](https://reacttraining.com/react-router/web/api/HashRouter)
- [Gatsby Breadcrumb Plugin](/packages/gatsby-plugin-breadcrumb/#breadcrumb-props)
- [Create Modal w/ Navigation State using React Router](https://codedaily.io/tutorials/47/Create-a-Modal-Route-with-Link-and-Nav-State-in-React-Router)
