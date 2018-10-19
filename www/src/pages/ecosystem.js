import React, { Component } from "react"
import Helmet from "react-helmet"
import { rhythm } from "../utils/typography"
import { colors } from "../utils/presets"

import Layout from "../components/layout/layout-default"
import ContentContainer from "../components/layout/content-container"
import PageHeading from "../components/layout/page-heading"

import { BlogIcon } from "../assets/mobile-nav-icons"

class EcosystemPage extends Component {
  render() {
    const { location } = this.props
    const pageTitle = "Ecosystem"

    return (
      <Layout location={location} pageTitle={pageTitle} pageIcon={BlogIcon}>
        <ContentContainer>This is the Content</ContentContainer>
      </Layout>
    )
  }
}

export default EcosystemPage
