import React from "react"
import PropTypes from "prop-types"

import InternalPageRenderer from "./page-renderer"
import loader from "./loader"

const ProdPageRenderer = ({ location }) => {
  const pageResources = loader.getResourcesForPathnameSync(location.pathname)
  return React.createElement(InternalPageRenderer, {
    key: location.pathname,
    location,
    pageResources,
    ...pageResources.json,
  })
}

ProdPageRenderer.propTypes = {
  location: PropTypes.shape({
    pathname: PropTypes.string.isRequired,
  }).isRequired,
}

export default ProdPageRenderer
