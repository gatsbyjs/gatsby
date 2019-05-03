import React, { Component } from "react"
import { graphql, Link } from "gatsby"

import Button from "../../components/button"
import Layout from "../../components/layout"
import EvaluationTable from "../../components/features/evaluation-table"
import { itemListFeatures } from "../../utils/sidebar/item-list"
import { getFeaturesData } from "../../utils/get-csv-features-data"
import Container from "../../components/container"
import FooterLinks from "../../components/shared/footer-links"
import FeaturesFooter from "../../components/features/features-footer"
import LegendTable from "../../components/features/legend-table"
import featureComparisonOptions from "../../data/features/comparison-options.json"
import { fontSizes, colors, space } from "../../utils/presets"

const controlButtonStyles = {
  color: colors.gray.calm,
  fontWeight: 700,
  background: `transparent`,
  fontSize: fontSizes[5],
  textAlign: `center`,
  "&:hover": {
    cursor: `pointer`,
  },
  "&:active": { background: colors.ui.light },
}

const FeaturesHeader = () => (
  <section>
    <h1 id="introduction" style={{ marginTop: 0 }}>
      <Link to="features">Features</Link> > CMS
    </h1>
    <p>Looking for a specific technology? Find it on this page.</p>
    <LegendTable />
  </section>
)

const CmsFeaturesPage = ({ data, location }) => {
  const [selected, setSelected] = React.useState({})

  const { sections, sectionHeaders } = getFeaturesData(
    data.allGatsbyCmsSpecsCsv.edges
  )

  let comparators = []
  for (const [key, value] of Object.entries(selected)) {
    if (value) {
      comparators.push(key)
    }
  }

  return (
    <Layout
      location={location}
      itemList={itemListFeatures}
      enableScrollSync={true}
    >
      <Container>
        <main id={`reach-skip-nav`}>
          <FeaturesHeader />
          <h3>Comparison</h3>
          {featureComparisonOptions.cms.map(option => (
            <button
              key={option}
              css={{
                ...controlButtonStyles,
                borderColor: selected[option]
                  ? colors.whisteria
                  : colors.ui.whisper,
                background: selected[option] ? colors.lavender : `inherit`,
              }}
              onClick={e =>
                setSelected({ ...selected, [option]: !selected[option] })
              }
            >
              {option}
            </button>
          ))}
          <Button to={`/features/cms/gatsby-vs-${comparators.join(`-vs-`)}`}>
            Compare
          </Button>
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
