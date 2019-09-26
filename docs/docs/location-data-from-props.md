---
title: "Location Data from Props"
---

## What is location data

Sometimes it can be helpful to know exactly what your app's browser URL is at any given stage. Using [@reach/router](https://github.com/reach/router) for [client-side routing](/docs/glossary#client-side) in Gatsby, `location` data represents where the app is currently, where you'd like it to go, and other helpful information. The `location` object is never mutated but `reach@router` makes it helpful to determine when navigation happens.

Using `hash` is one way to update the browser URL and the DOM without having the browser do a full reload. The HashHistory is used to track browser history when using [hashrouter](https://github.com/ReactTraining/react-router/blob/master/packages/react-router-dom/docs/api/HashRouter.md#hashrouter) instead of [browserrouter](https://github.com/ReactTraining/react-router/blob/master/packages/react-router-dom/docs/api/BrowserRouter.md#browserrouter) which uses the newer HTML5 history API.

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

## Use cases

You can provide a location object instead of strings, helpful in a number of situations.

- Providing state to linked components
- Client-only routes
- Fetching Data
- Animation Transition

## Example

```js:title=index.js
// usually you'd do this
<Link to="/somecomponent"/>

// but if we want to add some additional state
<Link to={
  pathname: '/somecomponent',
  state: {modal: true}
}>
```

Then from the recieving component we can conditionally render it based on the location state.

```js:title=some-component.js
const SomeComponent = ({ location }) => {
  const { state = {} } = location
  const { modal } = state
  return modal ? (
    <div className="modal">I'm a modal of Some Component!</div>
  ) : (
    <div>Welcome to the Some Component page!</div>
  )
}
```

## Gatsby advantages

The great thing is you can expect the location prop to be available to you on everypage thanks to its use of `@reach/router`

## Other resources

- [@reach/router docs](https://reach.tech/router/api/Location)
- [react-router location docs](https://github.com/ReactTraining/react-router/blob/master/packages/react-router/docs/api/location.md)
- [Hash Router](https://reacttraining.com/react-router/web/api/HashRouter)
- [Gatsby Breadcrumb Plugin](https://www.gatsbyjs.org/packages/gatsby-plugin-breadcrumb/#breadcrumb-props)
- [Create Modal w/ Navigation State using React Router](https://codedaily.io/tutorials/47/Create-a-Modal-Route-with-Link-and-Nav-State-in-React-Router)
