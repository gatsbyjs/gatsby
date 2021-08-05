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
  const defaultEntries = data.default.nodes
  const englishEntries = data.english.nodes
  const germanEntries = data.german.nodes
  return (
    <Layout>
      {defaultEntries.map(({ id, title, richText }) => {
        const slug = slugify(title, { strict: true, lower: true })
        return (
          <div data-cy-id={slug} key={id}>
            <h2>{title}</h2>
            {renderRichText(richText, options)}
            <hr />
          </div>
        )
      })}

      <h1>English Locale</h1>
      {englishEntries.map(({ id, title, richTextLocalized }) => {
        const slug = slugify(title, { strict: true, lower: true })
        return (
          <div data-cy-id={`english-${slug}`} key={id}>
            <h2>{title}</h2>
            {renderRichText(richTextLocalized, options)}
            <hr />
          </div>
        )
      })}

      <h1>German Locale</h1>
      {germanEntries.map(({ id, title, richTextLocalized }) => {
        const slug = slugify(title, { strict: true, lower: true })
        return (
          <div data-cy-id={`german-${slug}`} key={id}>
            <h2>{title}</h2>
            {renderRichText(richTextLocalized, options)}
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
    default: allContentfulRichText(
      sort: { fields: title }
      filter: {
        title: { glob: "!*Localized*|*Validated*" }
        node_locale: { eq: "en-US" }
      }
    ) {
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
                ... on ContentfulContentReference {
                  contentful_id
                  title
                  content_reference {
                    ... on ContentfulContentReference {
                      contentful_id
                      title
                    }
                  }
                }
              }
              many {
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
                  content_reference {
                    ... on ContentfulContentReference {
                      id
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
    english: allContentfulRichText(
      sort: { fields: title }
      filter: { title: { glob: "*Localized*" }, node_locale: { eq: "en-US" } }
    ) {
      nodes {
        id
        title
        richTextLocalized {
          raw
        }
      }
    }
    german: allContentfulRichText(
      sort: { fields: title }
      filter: { title: { glob: "*Localized*" }, node_locale: { eq: "de-DE" } }
    ) {
      nodes {
        id
        title
        richTextLocalized {
          raw
        }
      }
    }
  }
`
