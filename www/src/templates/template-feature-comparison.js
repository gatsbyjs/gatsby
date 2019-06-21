import React, { Component } from "react"
import { Helmet } from "react-helmet"
import Layout from "../components/layout"
import FooterLinks from "../components/shared/footer-links"
import Container from "../components/container"
import EvaluationTable from "../components/features/evaluation-table"
import LogoDictionary from "../components/features/logo-dictionary"
import { itemListFeatures } from "../utils/sidebar/item-list"
import { getFeaturesData } from "../utils/get-csv-features-data"

class FeatureComparison extends Component {
  render() {
    const {
      pageContext: { options, featureType },
      data,
    } = this.props
    const optionsDisplay = options.map(o => o.display)
    const titleString = `Comparison of Gatsby vs ${optionsDisplay.join(` vs `)}`
    console.log(optionsDisplay)

    const { sections, sectionHeaders } =
      featureType === `cms`
        ? getFeaturesData(data.allGatsbyCmsSpecsCsv.edges)
        : getFeaturesData(data.allGatsbyJamstackSpecsCsv.edges)

    return (
      <Layout location={location} itemList={itemListFeatures}>
        <Helmet>
          <title>{titleString}</title>
        </Helmet>
        <Container>
          <main>
            <h1>{titleString}</h1>
          </main>
          <EvaluationTable
            options={options}
            sections={sections}
            sectionHeaders={sectionHeaders}
          />
          <FooterLinks />
        </Container>
      </Layout>
    )
  }
}

export default FeatureComparison

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
    allGatsbyJamstackSpecsCsv {
      edges {
        node {
          Category
          Subcategory
          Feature
          Gatsby
          Nextjs
          Jekyll
          Hugo
          Nuxtjs
          Description
        }
      }
    }
  }
`
