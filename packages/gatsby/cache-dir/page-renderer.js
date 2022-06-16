import React, { createElement } from "react"
import PropTypes from "prop-types"
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
    }

    let linkElem
    let metaElem

    const pageComponent = this.props.pageResources.component

    if (pageComponent.links) {
      if (typeof pageComponent.links !== `function`)
        throw new Error(
          `Expected "links" export to be a function got "${typeof pageComponent.links}".`
        )

      linkElem = React.createElement(pageComponent.links, props, null)
      console.log(`linkElem`, linkElem)
    }

    if (pageComponent.meta) {
      if (typeof pageComponent.meta !== `function`)
        throw new Error(
          `Expected "meta" export to be a function got "${typeof pageComponent.meta}".`
        )

      metaElem = React.createElement(pageComponent.meta, props, null)
    }

    const preferDefault = m => (m && m.default) || m

    const pageElement = createElement(
      preferDefault(this.props.pageResources.component),
      {
        ...props,
        key: this.props.path || this.props.pageResources.page.path,
      }
    )

    const wrappedPage = apiRunner(
      `wrapPageElement`,
      { element: pageElement, props },
      pageElement,
      ({ result }) => {
        return { element: result, props }
      }
    ).pop()

    return (
      <>
        {linkElem}
        {metaElem}
        {wrappedPage}
      </>
    )
  }
}

PageRenderer.propTypes = {
  location: PropTypes.object.isRequired,
  pageResources: PropTypes.object.isRequired,
  data: PropTypes.object,
  pageContext: PropTypes.object.isRequired,
}

export default PageRenderer
