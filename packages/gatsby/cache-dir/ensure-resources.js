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

  static getDerivedStateFromProps({ pageResources, location }, prevState) {
    if (prevState.location !== location) {
      const pageResources = loader.getResourcesForPathnameSync(
        location.pathname
      )

      if (pageResources) {
        return {
          pageResources,
          location: { ...location },
        }
      }
    }

    return null
  }

  componentDidUpdate(prevProps) {
    if (prevProps === this.props) return

    const { pathname } = this.props.location

    if (!loader.getResourcesForPathnameSync(pathname))
      // Page resources won't be set in cases where the browser back button
      // or forward button is pushed as we can't wait as normal for resources
      // to load before changing the page.
      loader.getResourcesForPathname(pathname).then(pageResources => {
        // The page may have changed since we started this, in which case doesn't update

        if (this.props.location.pathname !== location.pathname) {
          return
        }

        this.setState({
          location: { ...location },
          pageResources,
        })
      })
  }

  shouldComponentUpdate(nextProps, nextState) {
    // 404
    if (!nextState.pageResources) {
      return true
    }
    // Check if the component or json have changed.
    if (!this.state.pageResources && nextState.pageResources) {
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
    // This should only occur if the network is offline, or if the
    // path is nonexistent and there's no custom 404 page.
    if (
      process.env.NODE_ENV === `production` &&
      !(this.state.pageResources && this.state.pageResources.json)
    ) {
      // Do this, rather than simply `window.location.reload()`, so that
      // pressing the back/forward buttons work - otherwise Reach Router will
      // try to handle back/forward navigation, causing the URL to change but
      // the page displayed to stay the same.
      const originalUrl = new URL(location.href)
      window.history.replaceState({}, `404`, `${location.pathname}?gatsby-404`)
      window.location.replace(originalUrl)

      return null
    }

    return this.props.children(this.state)
  }
}

EnsureResources.propTypes = {
  location: PropTypes.object.isRequired,
  pageResources: PropTypes.object,
}

export default EnsureResources
