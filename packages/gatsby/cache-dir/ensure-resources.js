import React from "react"
import PropTypes from "prop-types"
import loader from "./loader"
import shallowCompare from "shallow-compare"

// Pass pathname in as prop.
// component will try fetching resources. If they exist,
// will just render, else will render null.
class EnsureResources extends React.Component {
  constructor(props) {
    super()
    let location = props.location

    // Set the pathname for 404 pages.
    const pathname = this.getPathName(location)

    this.state = {
      lastPathname: location.pathname,
      pageResources: loader.getResourcesForPathnameSync(pathname),
    }
  }

  static getDerivedStateFromProps({ pageResources, location }, prevState) {
    let nextState = { lastPathname: location.pathname }

    if (prevState.lastPathname !== location.pathname) {
      const pageResources = loader.getResourcesForPathnameSync(
        location.pathname
      )

      if (pageResources) {
        nextState.pageResources = pageResources
      }
    }

    return nextState
  }

  componentDidUpdate(prevProps) {
    if (prevProps === this.props) return

    const { location } = this.props
    const pathName = this.getPathName(location)

    if (!loader.getResourcesForPathnameSync(pathName))
      // Page resources won't be set in cases where the browser back button
      // or forward button is pushed as we can't wait as normal for resources
      // to load before changing the page.
      loader.getResourcesForPathname(pathName).then(pageResources => {
        // The page may have changed since we started this, in which case doesn't update

        if (this.props.location.pathname !== location.pathname) {
          return
        }

        this.setState({
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
      this.props.location.key !== nextProps.location.key &&
      nextState.pageResources.page &&
      (nextState.pageResources.page.matchPath ||
        nextState.pageResources.page.path)
    ) {
      return true
    }

    return shallowCompare(this, nextProps, nextState)
  }

  getPathName(location) {
    return !loader.getPage(location.pathname) ? `/404.html` : location.pathname
  }

  render() {
    if (
      process.env.NODE_ENV === `production` &&
      !(this.state.pageResources && this.state.pageResources.json)
    ) {
      // Try to load the page directly - this should result in a 404 or
      // network offline error.
      const url = new URL(window.location)
      if (url.search) {
        url.search += `&no-cache=1`
      } else {
        url.search = `?no-cache=1`
      }
      window.location.replace(url)

      return null
    } else if (
      process.env.NODE_ENV !== `production` &&
      !this.state.pageResources
    ) {
      return null
    }

    return this.props.children(this.state.pageResources)
  }
}

EnsureResources.propTypes = {
  location: PropTypes.object.isRequired,
  pageResources: PropTypes.object,
}

export default EnsureResources
