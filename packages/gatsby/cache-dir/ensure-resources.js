import React from "react"
import loader, { PageResourceStatus } from "./loader"
import shallowCompare from "shallow-compare"

function EnsureResources({location, children, pageResources}) {
  const [location, setLocation] = React.useState({ ...location });
  const [pageResources, setPageResources] = React.useState(pageResources ||
        loader.loadPageSync(location.pathname + location.search, {
          withErrorDetails: true,
        }));

  function getDerivedStateFromProps({ location }, prevState) {
    if (prevState.location.href !== location.href) {
      const pageResources = loader.loadPageSync(
        location.pathname + location.search,
        {
          withErrorDetails: true,
        }
      )

      return {
        pageResources,
        location: { ...location },
      }
    }

    return {
      location: { ...location },
    }
  }

  function loadResources(rawPath) {
    loader.loadPage(rawPath).then(pageResources => {
      if (pageResources && pageResources.status !== PageResourceStatus.Error) {
        this.setState({
          location: { ...window.location },
          pageResources,
        })
      } else {
        window.history.replaceState({}, ``, location.href)
        window.location = rawPath
      }
    })
  }

  function shouldComponentUpdate(nextProps, nextState) {
    // Always return false if we're missing resources.
    if (!nextState.pageResources) {
      loadResources(
        nextProps.location.pathname + nextProps.location.search
      )
      return false
    }

    if (
      process.env.BUILD_STAGE === `develop` &&
      nextState.pageResources.stale
    ) {
      loadResources(
        nextProps.location.pathname + nextProps.location.search
      )
      return false
    }

    // Check if the component or json have changed.
    if (pageResources !== nextState.pageResources) {
      return true
    }
    if (
      pageResources.component !== nextState.pageResources.component
    ) {
      return true
    }

    if (pageResources.json !== nextState.pageResources.json) {
      return true
    }
    // Check if location has changed on a page using internal routing
    // via matchPath configuration.
    if (
      location.key !== nextState.location.key &&
      nextState.pageResources.page &&
      (nextState.pageResources.page.matchPath ||
        nextState.pageResources.page.path)
    ) {
      return true
    }
    return shallowCompare(this, nextProps, nextState)
  }

  if (
process.env.NODE_ENV !== `production` &&
(!pageResources ||
pageResources.status === PageResourceStatus.Error)
) {
const message = `EnsureResources was not able to find resources for path: "${location.pathname}"
This typically means that an issue occurred building components for that path.
Run \`gatsby clean\` to remove any cached elements.`
if (pageResources?.error) {
console.error(message)
throw pageResources.error
}

throw new Error(message)
}

return children(this.state);
}

export default EnsureResources
