import { graphql } from "gatsby"
import * as React from "react"
import slugify from "slugify"

import Layout from "../components/layout"

import * as components from "../components/references"

function renderReferencedComponent(ref) {
  const Component = components[ref.__typename]
  if (!Component) {
    throw new Error(
      `Unable to render referenced component of type ${ref.__typename}`
    )
  }
  return <Component {...ref} />
}

const ContentReferencePage = ({ data }) => {
  const entries = data.allContentfulContentReference.nodes
  return (
    <Layout>
      {entries.map(({ contentful_id, title, one, many }) => {
        const slug = slugify(title, { strict: true, lower: true })

        let content = null
        if (many) {
          content = many.map(renderReferencedComponent)
        }

        if (one) {
          content = renderReferencedComponent(one)
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

export default ContentReferencePage

export const pageQuery = graphql`
  query ContentReferenceQuery {
    allContentfulContentReference(sort: { fields: title }) {
      nodes {
        title
        contentful_id
        one {
          __typename
          ... on ContentfulText {
            contentful_id
            title
            short
          }
          ... on ContentfulContentReference {
            contentful_id
            title
            one {
              ... on ContentfulText {
                title
                short
              }
              ... on ContentfulContentReference {
                title
              }
            }
            many {
              ... on ContentfulText {
                title
                short
              }
              ... on ContentfulNumber {
                title
                integer
              }
              ... on ContentfulContentReference {
                title
              }
            }
          }
        }
        many {
          __typename
          ... on ContentfulText {
            contentful_id
            title
            short
          }
          ... on ContentfulNumber {
            contentful_id
            title
            integer
          }
          ... on ContentfulContentReference {
            contentful_id
            title
            one {
              ... on ContentfulText {
                title
                short
              }
              ... on ContentfulContentReference {
                title
              }
            }
            many {
              ... on ContentfulText {
                title
                short
              }
              ... on ContentfulNumber {
                title
                integer
              }
              ... on ContentfulContentReference {
                title
              }
            }
          }
        }
      }
    }
  }
`
