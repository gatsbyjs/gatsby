import React, { Component } from "react"
import { graphql, Link } from "gatsby"

import Layout from "../components/layout"
import EvaluationTable from "../components/evaluation-table"
import { itemListFeatures } from "../utils/sidebar/item-list"
import Container from "../components/container"
import FooterLinks from "../components/shared/footer-links"
import LegendTable from "../components/features/legend-table"
import { space, fontSizes, letterSpacings } from "../utils/presets"

const FeaturesHeader = () => (
  <section>
    <h1 id="introduction" style={{ marginTop: 0 }}>
      Features
    </h1>
    <p>
      Coming from the CMS world? See{" "}
      <Link to="/features/cms">Gatsby versus traditional CMS</Link>
      <br />
      Coming from the JAMstack world? See{" "}
      <Link to="/features/jamstack">Gatsby versus JAMstack frameworks</Link>
    </p>
    <p>
      There are many ways to build a website. If you’re considering Gatsby, you
      may also be looking at some alternatives:
    </p>
    <ul>
      <li>
        <strong>JAMstack frameworks</strong> such as
        {` `}
        <a
          href="https://jekyllrb.com/"
          target="_blank"
          rel="noopener noreferrer"
        >
          Jekyll
        </a>
        {` `}
        <a href="https://nextjs.org/" target="_blank" rel="noopener noreferrer">
          Next.js
        </a>
        , and
        {` `}
        <a href="https://nuxtjs.org/" target="_blank" rel="noopener noreferrer">
          Nuxt.js
        </a>
        {` `}
        let you put text or markdown in a specific directory such as
        <code>pages/</code> in a version-controlled codebase. They then build a
        specific kind of site, usually a blog, as HTML files from the content
        you’ve added. These files can be cached and served from a CDN.
      </li>
      <li>
        <strong>Traditional content management systems</strong> (CMSs) like
        {` `}
        <a
          href="https://wordpress.org/"
          target="_blank"
          rel="noopener noreferrer"
        >
          WordPress
        </a>{" "}
        and
        {` `}
        <a href="https://drupal.org/" target="_blank" rel="noopener noreferrer">
          Drupal
        </a>
        {` `}
        give you an online text editor to create content. You customize the look
        and feel by choosing themes and plugins or by writing custom PHP or
        JavaScript code. Content is saved in a database, which is retrieved and
        sent to users when they visit the website. Depending on your
        requirements you can self-host your website or use an official hosting
        provider.
      </li>
    </ul>
    <p>
      The chart below details Gatsby’s capabilities in comparison with a
      representative from each category. Click on any row to see a more detailed
      explanation on that feature and our rating for each system.
    </p>
    <h6
      id="legend"
      css={{
        fontWeight: `normal`,
        textTransform: `uppercase`,
        letterSpacing: letterSpacings.tracked,
      }}
    >
      Legend
    </h6>
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
      this.props.data.allGatsbySpecsCsv.edges
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
                `Feature`,
                `Gatsby`,
                `Static site gens`,
                `CMS`,
                `Site builders`,
              ]}
              nodeFieldProperties={[
                `Feature`,
                `Gatsby`,
                `Jekyll`,
                `WordPress`,
                `Squarespace`,
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
    allGatsbySpecsCsv {
      edges {
        node {
          Category
          Subcategory
          Feature
          Gatsby
          WordPress
          Squarespace
          Jekyll
          Description
        }
      }
    }
  }
`
