import React from "react";
import { applyRouterMiddleware, Router, browserHistory } from "react-router";
import useScroll from "react-router-scroll/lib/useScroll";

const apiRunner = require("./api-runner-browser");
const rootRoute = require("./child-routes");
console.log(rootRoute);

let currentLocation;

browserHistory.listen(location => {
  currentLocation = location;
});

function shouldUpdateScroll(prevRouterProps, { location: { pathname } }) {
  const results = apiRunner(`shouldUpdateScroll`, {
    prevRouterProps,
    pathname,
  });
  if (results.length > 0) {
    return results[0];
  }

  if (prevRouterProps) {
    const { location: { pathname: oldPathname } } = prevRouterProps;
    if (oldPathname === pathname) {
      return false;
    }
  }
  return true;
}

const Root = () => (
  <Router
    history={browserHistory}
    routes={rootRoute}
    render={applyRouterMiddleware(useScroll(shouldUpdateScroll))}
    onUpdate={() => {
      apiRunner(`onRouteUpdate`, currentLocation);
    }}
  />
);

// Let site, plugins wrap the site e.g. for Redux.
const WrappedRoot = apiRunner(`wrapRootComponent`, { Root }, Root)[0];

export default WrappedRoot;
