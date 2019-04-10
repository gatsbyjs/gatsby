import React from "react"
import PropTypes from "prop-types"

import Layout from "../layout"
import PageWithPluginSearchBar from "../page-with-plugin-searchbar"

const PluginLibraryWrappedLayout = props => {
  const { children, location } = props

  return (
    <Layout location={location}>
      <PageWithPluginSearchBar
        isPluginsIndex={location.pathname === `/plugins/`}
        location={location}
      >
        {children}
      </PageWithPluginSearchBar>
    </Layout>
  )
}

PluginLibraryWrappedLayout.propTypes = {
  children: PropTypes.node.isRequired,
  location: PropTypes.object.isRequired,
}

export default PluginLibraryWrappedLayout
