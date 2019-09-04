import React, { createElement } from "react"
import PropTypes from "prop-types"
import { match } from "@reach/router/lib/utils"
import { publicLoader } from "./loader"
import { apiRunner } from "./api-runner-browser"

// Renders page
class PageRenderer extends React.Component {
  render() {
    const props = {
      ...this.props,
      pathContext: this.props.pageContext,
    }

    if (this.props.pageContext.matchPath) {
      const { params } = match(
        this.props.pageContext.matchPath,
        this.props.location.pathname
      )
      props.pageContext.params = params
      props.pathContext.params = params
    }

    const [replacementElement] = apiRunner(`replaceComponentRenderer`, {
      props: this.props,
      loader: publicLoader,
    })

    const pageElement =
      replacementElement ||
      createElement(this.props.pageResources.component, {
        ...props,
        key: this.props.path || this.props.pageResources.page.path,
      })

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
