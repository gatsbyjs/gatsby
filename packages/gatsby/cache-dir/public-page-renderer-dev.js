import React from "react"
import PropTypes from "prop-types"

import loader from "./loader"
import JSONStore from "./json-store"
import stripPrefix from "./strip-prefix"

const DevPageRenderer = ({ location }) => {
  const pageResources = loader.loadPageSync(
    stripPrefix(location.pathname, __BASE_PATH__)
  )
  return React.createElement(JSONStore, {
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
