import React, { Component } from "react"
import { graphql } from "gatsby"

import Layout from "../components/layout/layout-with-heading"
import EcosystemBoard from "../components/ecosystem/ecosystem-board"
import FooterLinks from "../components/shared/footer-links"

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
            starterShowcase: { slug, name, description, stars },
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
        stars,
        thumbnail,
      }
    })

    const plugins = pluginsData.map(item => item.node)

    const pageTitle = `Ecosystem`
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
        <FooterLinks />
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
        fields: {
          starterShowcase: { slug: { in: $featuredStarters } }
          hasScreenshot: { eq: true }
        }
      }
    ) {
      edges {
        node {
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
