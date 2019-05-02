import React, { Component } from "react"
import { graphql, Link } from "gatsby"

import Layout from "../../components/layout"
import EvaluationTable from "../../components/evaluation-table"
import EvaluationCell from "../../components/evaluation-cell"
import { itemListFeatures } from "../../utils/sidebar/item-list"
import Container from "../../components/container"
import FooterLinks from "../../components/shared/footer-links"
import LegendTable from "../../components/features/legend-table"
import { space, fontSizes } from "../../utils/presets"

const FeaturesHeader = () => (
  <section>
    <h1 id="introduction" style={{ marginTop: 0 }}>
      <Link to="features">Features</Link> > JAMstack
    </h1>
    <p>Looking for a specific technology? Find it on this page.</p>
    <LegendTable />
  </section>
)

const getFeaturesData = function(data) {
  const sections = (data || [])
    .map((row, i) => (row.node.Category ? i : -1))
    .filter(rowNum => rowNum !== -1)
    .map((rowNum, i, arr) => {
      if (i < arr.length - 1) {
        return [rowNum, arr[i + 1]]
      }

      return [rowNum, data.length]
    })
    .map(bounds => data.slice(bounds[0], bounds[1]))

  const sectionHeaders = (data || [])
    .filter(row => row.node.Category)
    .map(row => row.node.Category)

  return {
    sectionHeaders,
    sections,
  }
}

const FeaturesFooter = () => (
  <p css={{ fontSize: fontSizes[1], marginTop: space[8] }}>
    Want to help keep this information complete, accurate, and up-to-date?
    Please comment
    {` `}
    <a
      href="https://github.com/gatsbyjs/gatsby/issues/2444"
      target="_blank"
      rel="noopener noreferrer"
    >
      here.
    </a>
  </p>
)

class JamstackFeaturesPage extends Component {
  render() {
    const { sections, sectionHeaders } = getFeaturesData(
      this.props.data.allGatsbyJamstackSpecsCsv.edges
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
              columnHeaders={[
                `Category`,
                `Gatsby`,
                `Next.js`,
                `Jekyll`,
                `Hugo`,
                `Nuxt.js`,
              ]}
              nodeFieldProperties={[
                `Feature`,
                `Gatsby`,
                `Nextjs`,
                `Jekyll`,
                `Hugo`,
                `Nuxtjs`,
              ]}
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

export default JamstackFeaturesPage

export const pageQuery = graphql`
  query {
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
