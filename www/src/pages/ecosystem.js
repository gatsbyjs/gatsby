import React from "react"
import { graphql } from "gatsby"

import Layout from "../components/layout/layout-with-heading"
import EcosystemBoard from "../components/ecosystem/ecosystem-board"
import PageMetadata from "../components/page-metadata"
import FooterLinks from "../components/shared/footer-links"

import { EcosystemIcon } from "../assets/icons"

export default function EcosystemPage({ location, data }) {
  const startersData = data.allStartersYaml.nodes
  const pluginsData = data.allNpmPackage.nodes

  const starters = startersData.map(item => {
    const { slug, name, description, stars } = item.fields.starterShowcase
    const thumbnail = item.childScreenshot.screenshotFile.childImageSharp.fixed

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

  return (
    <Layout
      location={location}
      pageTitle={pageTitle}
      pageIcon={<EcosystemIcon />}
    >
      <PageMetadata title="Ecosystem" />
      <EcosystemBoard starters={starters} plugins={plugins} />
      <FooterLinks />
    </Layout>
  )
}

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
