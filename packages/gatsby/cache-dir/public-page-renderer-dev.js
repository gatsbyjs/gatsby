import React from "react"
import PropTypes from "prop-types"

import loader from "./loader"
import JSONStoreForPageQueries from "./json-store-page-queries"

const DevPageRenderer = ({ location }) => {
  const pageResources = loader.loadPageSync(location.pathname)
  return React.createElement(JSONStoreForPageQueries, {
    location,
    pageResources,
  })
}

DevPageRenderer.propTypes = {
  location: PropTypes.shape({
    pathname: PropTypes.string.isRequired,
  }).isRequired,
}

export default DevPageRenderer
