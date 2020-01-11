import React, { createElement } from "react"
import PropTypes from "prop-types"
import { publicLoader } from "./loader"
import { apiRunner } from "./api-runner-browser"
import loadable from "@loadable/component"

// Renders page
class PageRenderer extends React.Component {
  render() {
    const props = {
      ...this.props,
      pathContext: this.props.pageContext,
    }

    const [replacementElement] = apiRunner(`replaceComponentRenderer`, {
      props: this.props,
      loader: publicLoader,
    })

    let PageComponent

    if (process.env.NODE_ENV === `production`) {
      PageComponent = this.props.pageResources.component
    } else {
      PageComponent = loadable(() => this.props.pageResources.component())
    }

    const pageElement =
      replacementElement ||
      createElement(PageComponent, {
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
