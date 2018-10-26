import React, { Component } from "react"
import Helmet from "react-helmet"
import { graphql } from "gatsby"

import { rhythm } from "../utils/typography"
import { colors } from "../utils/presets"

import Layout from "../components/layout/layout-with-heading"
import PageHeading from "../components/layout/page-heading"
import EcosystemBoard from "../components/ecosystem/ecosystem-board"

import { EcosystemIcon } from "../assets/mobile-nav-icons"
import { PluginsIcon, StartersIcon } from "../assets/ecosystem-icons"

class EcosystemPage extends Component {
  render() {
    const {
      location,
      data: {
        allStartersYaml: { edges: startersData },
        allNpmPackage: { edges: pluginsData },
      },
    } = this.props

    const starters = startersData.map(item => {
      const {
        node: {
          fields: {
            starterShowcase: {
              slug,
              name,
              description,
              lastUpdated,
              starts,
              gatsbyMajorVersion,
            },
          },
          childScreenshot,
        },
      } = item

      return {
        slug: `/starters${slug}`,
        name,
        description,
        lastUpdated,
        starts,
        gatsbyMajorVersion,
      }
    })

    const plugins = pluginsData.map(item => {
      const {
        node: { slug, name, description, downloadsLast30Days },
      } = item

      return { slug, name, description, downloadsLast30Days }
    })

    const pageTitle = "Ecosystem"
    const boardIcons = { plugins: PluginsIcon, starters: StartersIcon }

    return (
      <Layout
        location={location}
        pageTitle={pageTitle}
        pageIcon={EcosystemIcon}
      >
        <EcosystemBoard
          icons={boardIcons}
          starters={starters}
          plugins={plugins}
        />
      </Layout>
    )
  }
}

export default EcosystemPage

export const ecosystemQuery = graphql`
  query EcosystemQuery(
    $featuredStarters: [String]!
    $featuredPlugins: [String]!
  ) {
    allStartersYaml(
      filter: {
        fields: { starterShowcase: { name: { in: $featuredStarters } } }
      }
    ) {
      edges {
        node {
          fields {
            starterShowcase {
              slug
              description
              stars
              lastUpdated
              name
              gatsbyMajorVersion
            }
          }
          childScreenshot {
            screenshotFile {
              childImageSharp {
                fluid(maxWidth: 64) {
                  ...GatsbyImageSharpFluid_noBase64
                }
              }
            }
          }
        }
      }
    }
    allNpmPackage(filter: { name: { in: $featuredPlugins } }) {
      edges {
        node {
          slug
          name
          description
          downloadsLast30Days
        }
      }
    }
  }
`
