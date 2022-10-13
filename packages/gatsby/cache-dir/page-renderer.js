import * as React from "react"
import PropTypes from "prop-types"
import { apiRunner } from "./api-runner-browser"
import { grabMatchParams } from "./find-path"
import { headHandlerForBrowser } from "./head/head-export-handler-for-browser"
import { filterPageProps } from "./filter-page-props"

// Renders page
function PageRenderer(props) {
  const { path, location, pageResources } = props

  const pageComponentProps = filterPageProps({
    ...props,
    params: {
      ...grabMatchParams(location.pathname),
      ...pageResources.json.pageContext.__params,
    },
  })

  const preferDefault = m => (m && m.default) || m

  let pageElement
  if (pageResources.partialHydration) {
    pageElement = pageResources.partialHydration
  } else {
    pageElement = React.createElement(preferDefault(pageResources.component), {
      ...pageComponentProps,
      key: path || pageResources.page.path,
    })
  }

  const pageComponent = pageResources.head

  headHandlerForBrowser({
    pageComponent,
    staticQueryResults: pageResources.staticQueryResults,
    pageComponentProps,
  })

  const wrappedPage = apiRunner(
    `wrapPageElement`,
    {
      element: pageElement,
      props: pageComponentProps,
    },
    pageElement,
    ({ result }) => {
      return { element: result, props: pageComponentProps }
    }
  ).pop()

  return wrappedPage
}

PageRenderer.propTypes = {
  location: PropTypes.object.isRequired,
  pageResources: PropTypes.object.isRequired,
  data: PropTypes.object,
  pageContext: PropTypes.object.isRequired,
}

export default PageRenderer
