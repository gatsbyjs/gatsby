import React, { createElement } from "react"
import PropTypes from "prop-types"
import { apiRunner } from "./api-runner-browser"
import { grabMatchParams } from "./find-path"
import { renderToString } from "react-dom/server"
import { StaticQueryContext } from "gatsby"

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

    const preferDefault = m => (m && m.default) || m

    const pageElement = createElement(
      preferDefault(this.props.pageResources.component),
      {
        ...props,
        key: this.props.path || this.props.pageResources.page.path,
      }
    )

    const pageComponent = this.props.pageResources.component

    if (pageComponent.head) {
      if (typeof pageComponent.head !== `function`)
        throw new Error(
          `Expected "head" export to be a function got "${typeof pageComponent.head}".`
        )

      const headElement = createElement(
        StaticQueryContext.Provider,
        { value: this.props.pageResources.staticQueryResults },
        createElement(pageComponent.head, props, null)
      )

      // extract head nodes from string
      const rawString = renderToString(headElement)
      const parsed = new DOMParser().parseFromString(rawString, `text/html`)
      const headNodes = [...parsed.head.childNodes]

      // Remove previous head nodes
      const prevHeadNodes = [...document.querySelectorAll(`[data-gatsby-head]`)]
      prevHeadNodes.forEach(e => e.remove())

      // add attribute to new head nodes
      const newHeadNodes = headNodes.map(node => {
        node.setAttribute(`data-gatsby-head`, true)
        return node
      })

      // Append new head nodes
      document.head.append(...newHeadNodes)
    }

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
