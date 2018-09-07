import React, { createElement } from "react"
import PropTypes from "prop-types"
import { publicLoader } from "./loader"
import { apiRunner } from "./api-runner-browser"
import { onRouteUpdate, onPreRouteUpdate } from "./navigation"

// Renders page and fire on(Pre)RouteUpdate APIs
class PageRenderer extends React.Component {
  constructor(props) {
    super(props)
    onPreRouteUpdate(props.location)
  }

  componentDidMount() {
    onRouteUpdate(this.props.location)
  }

  componentDidUpdate(prevProps, prevState, shouldFireRouteUpdate) {
    if (shouldFireRouteUpdate) {
      onRouteUpdate(this.props.location)
    }
  }

  getSnapshotBeforeUpdate(prevProps, prevState) {
    if (this.props.location.pathname !== prevProps.location.pathname) {
      onPreRouteUpdate(this.props.location)
      return true
    }

    return false
  }

  render() {
    const props = {
      ...this.props,
      pathContext: this.props.pageContext,
    }

    const [replacementElement] = apiRunner(`replaceComponentRenderer`, {
      props: this.props,
      loader: publicLoader,
    })

    const pageElement =
      replacementElement ||
      createElement(this.props.pageResources.component, props)

    const wrappedPage = apiRunner(
      `wrapPageElement`,
      { element: pageElement, props },
      pageElement,
      ({ result }) => {
        return { element: result, props }
      }
    ).pop()

    return wrappedPage
  }
}

PageRenderer.propTypes = {
  location: PropTypes.object.isRequired,
  pageResources: PropTypes.object.isRequired,
  data: PropTypes.object,
  pageContext: PropTypes.object.isRequired,
}

export default PageRenderer
