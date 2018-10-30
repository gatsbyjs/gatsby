import React, { Component } from "react"
import Helmet from "react-helmet"
import { rhythm } from "../utils/typography"
import { colors } from "../utils/presets"

import Layout from "../components/layout/layout-with-heading"
import PageHeading from "../components/layout/page-heading"

import { EcosystemIcon } from "../assets/mobile-nav-icons"

class EcosystemPage extends Component {
  render() {
    const { location } = this.props
    const pageTitle = "Ecosystem"

    return (
      <Layout
        location={location}
        pageTitle={pageTitle}
        pageIcon={EcosystemIcon}
      >
        This is content of Ecosystem
      </Layout>
    )
  }
}

export default EcosystemPage
