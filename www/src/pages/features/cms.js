import React, { Component } from "react"
import { graphql, Link } from "gatsby"

import Layout from "../../components/layout"
import EvaluationTable from "../../components/features/evaluation-table"
import { itemListFeatures } from "../../utils/sidebar/item-list"
import { getFeaturesData } from "../../utils/get-csv-features-data"
import Container from "../../components/container"
import FooterLinks from "../../components/shared/footer-links"
import FeaturesFooter from "../../components/features/features-footer"
import LegendTable from "../../components/features/legend-table"

const FeaturesHeader = () => (
  <section>
    <h1 id="introduction" style={{ marginTop: 0 }}>
      <Link to="features">Features</Link> > CMS
    </h1>
    <p>Looking for a specific technology? Find it on this page.</p>
    <LegendTable />
  </section>
)

class CmsFeaturesPage extends Component {
  render() {
    const { sections, sectionHeaders } = getFeaturesData(
      this.props.data.allGatsbyCmsSpecsCsv.edges
    )

    return (
      <Layout
        location={this.props.location}
        itemList={itemListFeatures}
        enableScrollSync={true}
      >
        <Container>
          <main id={`reach-skip-nav`}>
            <FeaturesHeader />
            <EvaluationTable
              columnHeaders={[`Category`, `Gatsby`, `WordPress`, `Drupal`]}
              nodeFieldProperties={[`Feature`, `Gatsby`, `WordPress`, `Drupal`]}
              sections={sections}
              sectionHeaders={sectionHeaders}
            />
            <FeaturesFooter />
          </main>
          <FooterLinks />
        </Container>
      </Layout>
    )
  }
}

export default CmsFeaturesPage

export const pageQuery = graphql`
  query {
    allGatsbyCmsSpecsCsv {
      edges {
        node {
          Category
          Subcategory
          Feature
          Gatsby
          WordPress
          Drupal
          Description
        }
      }
    }
  }
`
