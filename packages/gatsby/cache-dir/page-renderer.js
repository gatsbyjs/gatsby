import React, { createElement } from "react"
import PropTypes from "prop-types"
import { publicLoader } from "./loader"
import { apiRunner } from "./api-runner-browser"
import { grabMatchParams } from "./find-path"

// Renders page
class PageRenderer extends React.Component {
  render() {
    const props = {
      ...this.props,
      params: {
        ...grabMatchParams(this.props.location.pathname),
        ...this.props.pageResources.json.pageContext.__params,
      },
      pathContext: this.props.pageContext,
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
