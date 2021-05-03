import { graphql } from "gatsby"
import GatsbyImage from "gatsby-image"
import * as React from "react"
import slugify from "slugify"

import Layout from "../components/layout"

const MediaReferencePage = ({ data }) => {
  const entries = data.allContentfulMediaReference.nodes
  return (
    <Layout>
      {entries.map(({ contentful_id, title, one, many }) => {
        const slug = slugify(title, { strict: true, lower: true })

        let content = null
        if (many) {
          content = many.map(imageData => (
            <GatsbyImage {...imageData} style={{ width: 200 }} />
          ))
        }

        if (one) {
          content = <GatsbyImage {...one} style={{ width: 200 }} />
        }

        return (
          <div data-cy-id={slug} key={contentful_id}>
            <h2>{title}</h2>
            {content}
          </div>
        )
      })}
    </Layout>
  )
}

export default MediaReferencePage

export const pageQuery = graphql`
  query MediaReferenceQuery {
    allContentfulMediaReference(sort: { fields: title }) {
      nodes {
        title
        contentful_id
        one {
          fluid(maxWidth: 200) {
            ...GatsbyContentfulFluid
          }
        }
        many {
          fluid(maxWidth: 200) {
            ...GatsbyContentfulFluid
          }
        }
      }
    }
  }
`
