import React from "react"
import PropTypes from "prop-types"

import pages from "./pages.json"
import loader from "./loader"
import JSONStore from "./json-store"

class DevPageRenderer extends React.Component {
  state = {}

  componentDidMount() {
    loader
      .getResourcesForPathname(this.props.location.pathname)
      .then(pageResources => {
        this.setState({ pageResources })
      })
  }

  render() {
    const { pageResources } = this.state
    const { location } = this.props

    if (!pageResources) {
      return null
    }

    return React.createElement(JSONStore, {
      pages,
      location,
      pageResources,
    })
  }
}

DevPageRenderer.propTypes = {
  location: PropTypes.shape({
    pathname: PropTypes.string.isRequired,
  }).isRequired,
}

export default DevPageRenderer
