import React, { Component } from "react"
import Layout from "../components/layout"
import { Helmet } from "react-helmet"
import FooterLinks from "../components/shared/footer-links"
import { itemListFeatures } from "../utils/sidebar/item-list"
import Container from "../components/container"

class FeatureComparison extends Component {
  render() {
    const {
      pageContext: { optionSet },
    } = this.props

    return (
      <Layout location={location} itemList={itemListFeatures}>
        <Helmet>
          <title>
            {optionSet
              .map(o => o.charAt(0).toUpperCase() + o.slice(1))
              .join(` vs `)}
          </title>
        </Helmet>
        <Container>
          <main>Comparison of Gatsby vs {optionSet.join(` vs `)}</main>
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
