import React from "react"
import PropTypes from "prop-types"
import loader from "./loader"
import shallowCompare from "shallow-compare"

// Pass pathname in as prop.
// component will try fetching resources. If they exist,
// will just render, else will render null.
// It will also wait for pageResources
// before propagating location change to children.
class EnsureResources extends React.Component {
  constructor(props) {
    super()
    let location = props.location

    this.state = {
      location: { ...location },
      pageResources: loader.getResourcesForPathnameSync(location.pathname),
    }
  }

  static getDerivedStateFromProps({ location }, prevState) {
    if (prevState.location !== location) {
      const pageResources = loader.getResourcesForPathnameSync(
        location.pathname
      )

      return {
        pageResources,
        location: { ...location },
      }
    }

    return null
  }

  retryResources(nextProps) {
    const { pathname } = nextProps.location

    if (!loader.getResourcesForPathnameSync(pathname)) {
      // Store the next location before resolving resources to check for updates
      this.nextLocation = nextProps.location

      // Page resources won't be set in cases where the browser back button
      // or forward button is pushed as we can't wait as normal for resources
      // to load before changing the page.
      loader.getResourcesForPathname(pathname).then(pageResources => {
        // The page may have changed since we started this, in which case doesn't update
        if (this.nextLocation !== nextProps.location) {
          return
        }

        if (pageResources && pageResources.json) {
          this.setState({
            location: { ...location },
            pageResources,
          })
          return
        }

        // If we still don't have resources, reload the page.
        // (This won't happen on initial render, since shouldComponentUpdate
        // isn't called for initial renders.)
        window.location.reload()
      })
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    // Always return false if we're missing resources.
    if (!(nextState.pageResources && nextState.pageResources.json)) {
      this.retryResources(nextProps)
      return false
    }

    // Check if the component or json have changed.
    if (this.state.pageResources !== nextState.pageResources) {
      return true
    }
    if (
      this.state.pageResources.component !== nextState.pageResources.component
    ) {
      return true
    }

    if (this.state.pageResources.json !== nextState.pageResources.json) {
      return true
    }

    // Check if location has changed on a page using internal routing
    // via matchPath configuration.
    if (
      this.state.location.key !== nextState.location.key &&
      nextState.pageResources.page &&
      (nextState.pageResources.page.matchPath ||
        nextState.pageResources.page.path)
    ) {
      return true
    }

    return shallowCompare(this, nextProps, nextState)
  }

  render() {
    if (this.state.pageResources && this.state.pageResources.json) {
      return this.props.children(this.state)
    } else {
      const __html = document.getElementById(`___gatsby`).innerHTML
      return <div dangerouslySetInnerHTML={{ __html }} />
    }
  }
}

EnsureResources.propTypes = {
  location: PropTypes.object.isRequired,
  pageResources: PropTypes.object,
}

export default EnsureResources
