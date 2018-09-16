import React, { createElement } from "react"
import PropTypes from "prop-types"
import { publicLoader } from "./loader"
import { apiRunner } from "./api-runner-browser"
import { onRouteUpdate, onPreRouteUpdate } from "./navigation"

// Renders page and fire on(Pre)RouteUpdate APIs
class PageRenderer extends React.Component {
  constructor(props) {
    super(props)
    if (props.isMain) {
      onPreRouteUpdate(props.location)
    }
  }

  componentDidMount() {
    if (this.props.isMain) {
      onRouteUpdate(this.props.location)
    }
  }

  componentDidUpdate(prevProps, prevState, shouldFireRouteUpdate) {
    if (this.props.isMain && shouldFireRouteUpdate) {
      onRouteUpdate(this.props.location)
    }
  }

  getSnapshotBeforeUpdate(prevProps, prevState) {
    if (this.props.isMain) {
      if (this.props.location.pathname !== prevProps.location.pathname) {
        onPreRouteUpdate(this.props.location)
        return true
      }

      return false
    }
    return null
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
  isMain: PropTypes.bool,
}

export default PageRenderer
