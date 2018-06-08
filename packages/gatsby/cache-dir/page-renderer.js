import React, { createElement } from "react"
import PropTypes from "prop-types"
import loader, { publicLoader } from "./loader"
import emitter from "./emitter"
import { polyfill } from "react-lifecycles-compat"
import shallowCompare from "shallow-compare"
import { apiRunner } from "./api-runner-browser"

// Pass pathname in as prop.
// component will try fetching resources. If they exist,
// will just render, else will render null.
class PageRenderer extends React.Component {
  constructor(props) {
    super()
    let location = props.location

    // Set the pathname for 404 pages.
    if (!loader.getPage(location.pathname)) {
      location = { ...location, pathname: `/404.html` }
    }

    this.state = {
      location,
      pageResources: loader.getResourcesForPathname(location.pathname),
    }
  }

  static getDerivedStateFromProps({ pageResources, location }, prevState) {
    let nextState = {}

    if (
      process.env.NODE_ENV !== `production` &&
      pageResources &&
      pageResources.json
    ) {
      nextState = { pageResources }
    }

    if (prevState.location.pathname !== location.pathname) {
      const pageResources = loader.getResourcesForPathname(location.pathname)

      if (pageResources) {
        nextState = { location, pageResources }
      } else if (!loader.getPage(location.pathname)) {
        nextState.location = { ...location, pathname: `/404.html` }
      }
    }

    return nextState
  }

  componentDidMount() {
    // Listen to events so when our page gets updated, we can transition.
    // This is only useful on delayed transitions as the page will get rendered
    // without the necessary page resources and then re-render once those come in.
    emitter.on(`onPostLoadPageResources`, e => {
      if (
        loader.getPage(this.state.location.pathname) &&
        e.page.path === loader.getPage(this.state.location.pathname).path
      ) {
        this.setState({ pageResources: e.pageResources })
      }
    })
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevProps === this.props) return

    const { location } = this.state
    if (!loader.getResourcesForPathname(location.pathname))
      // Page resources won't be set in cases where the browser back button
      // or forward button is pushed as we can't wait as normal for resources
      // to load before changing the page.
      loader.getResourcesForPathname(location.pathname, pageResources => {
        this.setState({
          location,
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
    if (!this.state.pageResources) return null

    const pathContext =
      process.env.NODE_ENV !== `production`
        ? this.props.pageContext
        : this.state.pageResources.json.pageContext

    const props = {
      ...this.props,
      ...this.state.pageResources.json,
      pathContext,
    }

    const [replacementComponent] = apiRunner(`replaceComponentRenderer`, {
      props,
      loader: publicLoader,
    })

    return createElement(
      replacementComponent || this.state.pageResources.component,
      props
    )
  }
}

PageRenderer.propTypes = {
  location: PropTypes.object,
  pageResources: PropTypes.object,
  pageContext: PropTypes.object,
}

export default polyfill(PageRenderer)
