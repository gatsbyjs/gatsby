import React, { createElement } from "react"
import PropTypes from "prop-types"
import { publicLoader } from "./loader"
import { apiRunner } from "./api-runner-browser"

// Renders page
class PageRenderer extends React.Component {
  // would be nice to not have to write this code ourselves..
  getParams() {
    const parts = /:[a-z]+/g.exec(this.props.path) || []
    const params = {}

    // only supports keys that are [adjfiasjf].js (which by now is translated into :asdfajsdif)
    parts.forEach(colonPart => {
      // strips off the starting `:` in something like `:id`
      const [, ...part] = colonPart
      params[part] = this.props[part]
    })

    if (this.props[`*`]) {
      params[`*`] = this.props[`*`]
    }

    return { ...params, ...this.props.pageResources.json.pageContext.__params }
  }

  render() {
    const props = {
      ...this.props,
      params: this.getParams(),
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
  params: PropTypes.object.isRequired,
  location: PropTypes.object.isRequired,
  pageResources: PropTypes.object.isRequired,
  data: PropTypes.object,
  pageContext: PropTypes.object.isRequired,
}

export default PageRenderer
