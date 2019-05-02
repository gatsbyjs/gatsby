import React, { Component } from "react"
import Layout from "../components/layout"
import { Helmet } from "react-helmet"
import FooterLinks from "../components/shared/footer-links"

class FeatureComparison extends Component {
  render() {
    const {
      pageContext: { optionSet },
    } = this.props

    return (
      <Layout location={location}>
        <Helmet>
          <title>{optionSet.map(o => o.toUpperCase()).join(` vs `)}</title>
        </Helmet>
        Comparison of Gatsby vs {optionSet.join(` vs `)}
        <FooterLinks />
      </Layout>
    )
  }
}

export default FeatureComparison
