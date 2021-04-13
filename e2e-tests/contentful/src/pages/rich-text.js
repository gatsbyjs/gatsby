import { graphql } from "gatsby"
import GatsbyImage from "gatsby-image"
import * as React from "react"
import slugify from "slugify"

import { BLOCKS, MARKS, INLINES } from "@contentful/rich-text-types"
import { renderRichText } from "gatsby-source-contentful/rich-text"

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

const options = {
  renderMark: {
    [MARKS.BOLD]: text => <strong data-cy-strong>{text}</strong>,
  },
  renderNode: {
    [BLOCKS.EMBEDDED_ASSET]: node => {
      const asset = node.data.target
      if (asset.fluid) {
        return <GatsbyImage {...asset} style={{ width: 200 }} />
      }
      return (
        <>
          <h2>Embedded NON-Image Asset</h2>
          <pre>
            <code>{JSON.stringify(asset, null, 2)}</code>
          </pre>
        </>
      )
    },
    [BLOCKS.EMBEDDED_ENTRY]: node => {
      const entry = node?.data?.target
      if (!entry) {
        throw new Error(
          `Entity not available for node:\n${JSON.stringify(node, null, 2)}`
        )
      }
      return renderReferencedComponent(entry)
    },
    [INLINES.EMBEDDED_ENTRY]: node => {
      const entry = node.data.target
      if (entry.__typename === "ContentfulText") {
        return (
          <span data-cy-id="inline-text">
            [Inline-ContentfulText] {entry.title}: {entry.short}
          </span>
        )
      }
      return (
        <span>
          [Inline-{entry.__typename}] {entry.title}
        </span>
      )
    },
  },
}

const RichTextPage = ({ data }) => {
  const entries = data.allContentfulRichText.nodes
  return (
    <Layout>
      {entries.map(({ id, title, richText }) => {
        const slug = slugify(title, { strict: true, lower: true })
        return (
          <div data-cy-id={slug} key={id}>
            <h2>{title}</h2>
            {renderRichText(richText, options)}
            <hr />
          </div>
        )
      })}
    </Layout>
  )
}

export default RichTextPage

export const pageQuery = graphql`
  query RichTextQuery {
    allContentfulRichText(sort: { fields: title }) {
      nodes {
        id
        title
        richText {
          raw
          references {
            __typename
            ... on ContentfulAsset {
              contentful_id
              fluid(maxWidth: 200) {
                ...GatsbyContentfulFluid
              }
            }
            ... on ContentfulText {
              contentful_id
              title
              short
            }
            ... on ContentfulLocation {
              contentful_id
              location {
                lat
                lon
              }
            }
            ... on ContentfulContentReference {
              contentful_id
              title
              one {
                __typename
                contentful_id
                ... on ContentfulText {
                  title
                  short
                }
                ... on ContentfulContentReference {
                  title
                  one {
                    ... on ContentfulContentReference {
                      title
                    }
                  }
                  many {
                    ... on ContentfulContentReference {
                      title
                    }
                  }
                }
              }
              many {
                __typename
                contentful_id
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
                  one {
                    ... on ContentfulContentReference {
                      title
                    }
                  }
                  many {
                    ... on ContentfulContentReference {
                      title
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
`
