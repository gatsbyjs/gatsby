import React from "react"
import shallowCompare from "shallow-compare"
import loader from "./loader"
import stripPrefix from "./strip-prefix"

class EnsureResources extends React.Component {
  constructor(props) {
    super()
    const { location, pageResources } = props
    this.state = {
      location: { ...location },
      pageResources:
        pageResources ||
        loader.loadPageSync(stripPrefix(location.pathname, __BASE_PATH__)),
    }
  }

  static getDerivedStateFromProps({ location }, prevState) {
    if (prevState.location.href !== location.href) {
      const pageResources = loader.loadPageSync(
        stripPrefix(location.pathname, __BASE_PATH__)
      )
      return {
        pageResources,
        location: { ...location },
      }
    }

    return null
  }

  loadResources(rawPath) {
    loader.loadPage(rawPath).then(pageResources => {
      if (pageResources && pageResources.status !== `error`) {
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

  shouldComponentUpdate(nextProps, nextState) {
    // Always return false if we're missing resources.
    if (!nextState.pageResources) {
      this.loadResources(
        stripPrefix(nextProps.location.pathname, __BASE_PATH__)
      )
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
    return this.props.children(this.state)
  }
}

export default EnsureResources
