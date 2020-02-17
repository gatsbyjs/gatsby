/** @jsx jsx */
import { jsx } from "theme-ui"
import { Component } from "react"
import { graphql } from "gatsby"
import { Helmet } from "react-helmet"

import Button from "../components/button"
import Layout from "../components/layout"
import Container from "../components/container"
import FooterLinks from "../components/shared/footer-links"
import LegendTable from "../components/features/legend-table"
import FeaturesFooter from "../components/features/features-footer"
import SimpleEvaluationTable from "../components/features/simple-evaluation-table"
import PageWithSidebar from "../components/page-with-sidebar"

const FeaturesHeader = () => (
  <section>
    <h1 id="introduction" sx={{ mt: 0 }}>
      Features Overview
    </h1>
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
        {`, `}
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
        <br />
        <p sx={{ mt: 2 }}>Coming from the JAMstack world?</p>
        <Button to="/features/jamstack/" secondary>
          Compare Gatsby vs JAMstack
        </Button>
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
        </a>
        {` `}
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
        <br />
        <p sx={{ mt: 2 }}>Coming from the CMS world?</p>
        <Button to="/features/cms/" secondary>
          Compare Gatsby vs CMS
        </Button>
      </li>
    </ul>
    <p>
      The chart below details Gatsby’s capabilities in comparison with a
      representative from each category. Click on any row to see a more detailed
      explanation on that feature and our rating for each system.
    </p>
    <h6
      id="legend"
      sx={{
        fontWeight: `body`,
        letterSpacing: `tracked`,
        textTransform: `uppercase`,
      }}
    >
      Legend
    </h6>
    <LegendTable />
  </section>
)

class FeaturesPage extends Component {
  render() {
    return (
      <Layout location={this.props.location}>
        <PageWithSidebar location={this.props.location}>
          <Helmet>
            <title>Features</title>
            <meta
              name="description"
              content="Learn how specific features like performance and support for modern technologies make Gatsby worth using."
            />
          </Helmet>
          <Container>
            <main id={`reach-skip-nav`}>
              <FeaturesHeader />
              <SimpleEvaluationTable
                title="Feature Comparison"
                headers={[
                  { display: `Category`, nodeFieldProperty: `Category` },
                  { display: `Gatsby`, nodeFieldProperty: `Gatsby` },
                  {
                    display: `JAMstack frameworks`,
                    nodeFieldProperty: `Jamstack`,
                  },
                  { display: `Traditional CMS`, nodeFieldProperty: `Cms` },
                ]}
                data={this.props.data.allGatsbyFeaturesSpecsCsv.edges}
              />
              <FeaturesFooter />
            </main>
            <FooterLinks />
          </Container>
        </PageWithSidebar>
      </Layout>
    )
  }
}

export default FeaturesPage

export const pageQuery = graphql`
  query {
    allGatsbyFeaturesSpecsCsv {
      edges {
        node {
          Category
          Gatsby
          Jamstack
          Cms
          Description
        }
      }
    }
  }
`
