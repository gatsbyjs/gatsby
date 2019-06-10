import React from "react"
import loader from "./loader"
import shallowCompare from "shallow-compare"

class PageChanger extends React.Component {
  constructor(props) {
    super()
    let location = props.location
    let pageResources = loader.loadPageSync(location.pathname)
    this.state = {
      location: { ...location },
      pageResources,
    }
  }

  static getDerivedStateFromProps({ location }, prevState) {
    if (prevState.location.href !== location.href) {
      const pageResources = loader.loadPageSync(location.pathname)

      return {
        pageResources,
        location: { ...location },
      }
    }

    return null
  }

  shouldComponentUpdate(nextProps, nextState) {
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

export default PageChanger
