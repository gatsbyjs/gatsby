import React from "react"
import { graphql } from "gatsby"

import Button from "../../components/button"
import Layout from "../../components/layout"
import EvaluationTable from "../../components/features/evaluation-table"
import { itemListFeatures } from "../../utils/sidebar/item-list"
import { getFeaturesData } from "../../utils/get-csv-features-data"
import Container from "../../components/container"
import FooterLinks from "../../components/shared/footer-links"
import FeaturesFooter from "../../components/features/features-footer"
import LegendTable from "../../components/features/legend-table"
import CompareButton from "../../components/features/compare-button"
import Breadcrumb from "../../components/docs-breadcrumb"
import featureComparisonOptions from "../../data/features/comparison-options.json"
import { space } from "../../utils/presets"
import useComparisonState from "../../hooks/use-comparison-state"

const FeaturesHeader = () => (
  <section>
    <h1 id="introduction" style={{ marginTop: 0 }}>
      CMS
    </h1>
    <p>Compare popular CMS options on this page.</p>
  </section>
)

const CmsFeaturesPage = ({ data, location }) => {
  const [selected, setSelected, comparators, hasSelected] = useComparisonState({
    wordpress: false,
    drupal: false,
  })

  const { sections, sectionHeaders } = getFeaturesData(
    data.allGatsbyCmsSpecsCsv.edges
  )

  return (
    <Layout
      location={location}
      itemList={itemListFeatures}
      enableScrollSync={true}
    >
      <Container>
        <main id={`reach-skip-nav`}>
          <Breadcrumb location={location} itemList={itemListFeatures} />
          <FeaturesHeader />
          <h3>Comparison</h3>
          <p>
            To see a filtered view of Gatsby compared with specific CMS
            technologies, choose the technologies to compare and then press
            Compare:
          </p>
          <div
            css={{
              display: `grid`,
              gridTemplateColumns: `repeat(auto-fit, minmax(75px, 120px))`,
              gridGap: space[2],
              paddingBottom: space[10],
            }}
          >
            {featureComparisonOptions.cms.map(({ key: optionKey, display }) => (
              <CompareButton
                key={optionKey}
                optionKey={optionKey}
                selected={selected[optionKey]}
                setSelected={setSelected}
              >
                {display}
              </CompareButton>
            ))}
            <Button
              style={{
                whiteSpace: `pre-wrap`,
              }}
              to={
                hasSelected
                  ? `/features/cms/gatsby-vs-${comparators.join(`-vs-`)}`
                  : location.pathname
              }
            >
              Compare with Gatsby
            </Button>
          </div>
          <LegendTable />
          <EvaluationTable
            options={featureComparisonOptions.cms}
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
