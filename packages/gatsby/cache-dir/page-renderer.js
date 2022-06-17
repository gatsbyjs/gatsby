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

      const rawString = renderToString(headElement)

      const parsed = new DOMParser().parseFromString(rawString, `text/html`)
      const nodes = [...parsed.head.childNodes]

      const allElem = [...document.querySelectorAll(`[data-gatsby-head]`)]
      allElem.forEach(e => e.remove())

      nodes.forEach(node => {
        node.setAttribute(`data-gatsby-head`, true)
        document.head.appendChild(node)
      })
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
