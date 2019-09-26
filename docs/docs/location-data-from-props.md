---
title: "Location Data from Props"
---
## What is Location?

Sometimes it can be helpful to know exactly what your app's browser url is at any given stage. Using @reach/router, location data represents where the app is currently, where you'd like it to go, and other helpful information.

## Use Cases

You can provide a location object instead of strings, helpful in a number of situations.

* Providing state to linked components

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
  const { state = {} } = location;
  const { modal } = state;
    return (
      modal ? <div className="modal">I'm a modal of Some Component!</div>
      : <div>Welcome to the Some Component page!</div>
  );
};
```

## Gatsby advantages
The great thing is you can expect the location prop to be available to you on everypage thanks to its use of `@reach/router`

## Other resources

- [@reach/router docs](https://reach.tech/router/api/Location)
- [react-router location docs](https://github.com/ReactTraining/react-router/blob/master/packages/react-router/docs/api/location.md)
- [Gatsby Breadcrumb Plugin](https://www.gatsbyjs.org/packages/gatsby-plugin-breadcrumb/#breadcrumb-props)
- [Create Modal w/ Navigation State using React Router](https://codedaily.io/tutorials/47/Create-a-Modal-Route-with-Link-and-Nav-State-in-React-Router)


