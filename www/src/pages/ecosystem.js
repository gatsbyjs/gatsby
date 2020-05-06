import React, { Component } from "react"
import { graphql } from "gatsby"

import Layout from "../components/layout/layout-with-heading"
import EcosystemBoard from "../components/ecosystem/ecosystem-board"
import PageMetadata from "../components/page-metadata"
import FooterLinks from "../components/shared/footer-links"

import { EcosystemIcon } from "../assets/icons"
import { PluginsIcon, StartersIcon } from "../assets/icons/ecosystem-icons"

class EcosystemPage extends Component {
  render() {
    const {
      location,
      data: {
        allStartersYaml: { nodes: startersData },
        allNpmPackage: { nodes: pluginsData },
      },
    } = this.props

    const starters = startersData.map(item => {
      const {
        fields: {
          starterShowcase: { slug, name, description, stars },
        },
        childScreenshot: {
          screenshotFile: {
            childImageSharp: { fixed: thumbnail },
          },
        },
      } = item

      return {
        slug: `/starters${slug}`,
        name,
        description,
        stars,
        thumbnail,
      }
    })

    const plugins = pluginsData

    const pageTitle = `Ecosystem`
    const boardIcons = { plugins: PluginsIcon, starters: StartersIcon }

    return (
      <Layout
        location={location}
        pageTitle={pageTitle}
        pageIcon={EcosystemIcon}
      >
        <PageMetadata title="Ecosystem" />
        <EcosystemBoard
          icons={boardIcons}
          starters={starters}
          plugins={plugins}
        />
        <FooterLinks />
      </Layout>
    )
  }
}

export default EcosystemPage

export const ecosystemQuery = graphql`
  query EcosystemQuery {
    allStartersYaml(
      filter: {
        fields: { featured: { eq: true }, hasScreenshot: { eq: true } }
      }
    ) {
      nodes {
        fields {
          starterShowcase {
            slug
            description
            stars
            name
          }
        }
        childScreenshot {
          screenshotFile {
            childImageSharp {
              fixed(width: 64, height: 64) {
                ...GatsbyImageSharpFixed_noBase64
              }
            }
          }
        }
      }
    }
    allNpmPackage(filter: { fields: { featured: { eq: true } } }) {
      nodes {
        slug
        name
        description
        humanDownloadsLast30Days
      }
    }
  }
`
