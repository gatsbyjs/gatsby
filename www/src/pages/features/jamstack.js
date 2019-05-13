import React from "react"
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
import CompareButton from "../../components/features/compare-button"
import featureComparisonOptions from "../../data/features/comparison-options.json"
import { space } from "../../utils/presets"

const FeaturesHeader = () => (
  <section>
    <h1 id="introduction" style={{ marginTop: 0 }}>
      <Link to="features">Features</Link> > JAMstack
    </h1>
    <p>Looking for a specific technology? Find it on this page.</p>
    <LegendTable />
  </section>
)

const JamstackFeaturesPage = ({ data, location }) => {
  const setSelected = (state, selected) => ({ ...state, ...selected })
  const [selected, dispatch] = React.useReducer(setSelected, {"nextjs": false, "jekyll": false, "hugo": false, "nuxtjs": false})

  const { sections, sectionHeaders } = getFeaturesData(
    data.allGatsbyJamstackSpecsCsv.edges
  )

  let comparators = []
  let hasSelected = false
  for (const [key, value] of Object.entries(selected)) {
    if (value) {
      comparators.push(key)
      hasSelected = true
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
          <div
            css={{
              display: `grid`,
              gridTemplateColumns: `repeat(${featureComparisonOptions.jamstack
                .length + 1}, 1fr)`,
              gridTemplateRows: `1fr 1fr`,
              gridGap: space[2],
            }}
          >
            {featureComparisonOptions.jamstack.map(({ key: optionKey, display }) => (
              <CompareButton
                key={optionKey}
                optionKey={optionKey}
                selected={selected[optionKey]}
                setSelected={dispatch}
              >
                {display}
              </CompareButton>
            ))}
            <Button
              to={
                hasSelected
                  ? `/features/jamstack/gatsby-vs-${comparators.join(`-vs-`)}`
                  : location.pathname
              }
            >
              Compare
            </Button>
          </div>
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
