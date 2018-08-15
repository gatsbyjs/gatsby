import React, { Component } from "react"
import Helmet from "react-helmet"
import Layout from "../../components/layout"

class CommunityView extends Component {
  render() {
    const { location } = this.props

    return (
      <Layout location={location}>
        <Helmet>
          <title>Community</title>
        </Helmet>
        <h1>HELLO FROM THE COMMUNITY PAGES</h1>
      </Layout>
    )
  }
}

export default CommunityView
