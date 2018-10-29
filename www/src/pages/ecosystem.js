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
import background from "../assets/ecosystem-background.svg"

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
              stars,
              gatsbyMajorVersion,
            },
          },
          childScreenshot: {
            screenshotFile: {
              childImageSharp: { fixed: thumbnail },
            },
          },
        },
      } = item

      return {
        slug: `/starters${slug}`,
        name,
        description,
        lastUpdated,
        stars,
        gatsbyMajorVersion,
        thumbnail,
      }
    })

    const plugins = pluginsData.map(item => item.node)

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
          background={background}
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
        fields: { starterShowcase: { slug: { in: $featuredStarters } } }
      }
    ) {
      edges {
        node {
          fields {
            starterShowcase {
              slug
              description
              stars
              lastUpdated(formatString: "MM/DD/YYYY")
              name
              gatsbyMajorVersion
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
    }
    allNpmPackage(filter: { name: { in: $featuredPlugins } }) {
      edges {
        node {
          slug
          name
          description
          humanDownloadsLast30Days
        }
      }
    }
  }
`
