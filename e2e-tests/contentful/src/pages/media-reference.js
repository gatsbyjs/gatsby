import { graphql } from "gatsby"
import * as React from "react"
import slugify from "slugify"

import Layout from "../components/layout"

const MediaReferencePage = ({ data }) => {
  const defaultEntries = data.default.nodes
  const englishEntries = data.english.nodes
  const germanEntries = data.german.nodes
  return (
    <Layout>
      {defaultEntries.map(({ sys: { id }, title, one, many }) => {
        const slug = slugify(title, { strict: true, lower: true })

        let content = null
        if (many) {
          content = many.map(imageData => (
            <img src={imageData.url} style={{ width: 200 }} alt={title} />
          ))
        }

        if (one) {
          content = <img src={one.url} style={{ width: 200 }} alt={title} />
        }

        return (
          <div data-cy-id={slug} key={id}>
            <h2>{title}</h2>
            {content}
          </div>
        )
      })}
      <h1>English Locale</h1>
      {englishEntries.map(
        ({ sys: { id }, title, one, oneLocalized, many, manyLocalized }) => {
          const slug = slugify(title, { strict: true, lower: true })

          let content = null
          if (manyLocalized) {
            content = manyLocalized.map(imageData => (
              <img src={imageData.url} style={{ width: 200 }} alt={title} />
            ))
          }

          if (oneLocalized) {
            content = (
              <img src={oneLocalized.url} style={{ width: 200 }} alt={title} />
            )
          }

          if (many) {
            content = many.map(imageData => (
              <img src={imageData.url} style={{ width: 200 }} alt={title} />
            ))
          }

          if (one) {
            content = <img src={one.url} style={{ width: 200 }} alt={title} />
          }

          return (
            <div data-cy-id={`english-${slug}`} key={id}>
              <h2>{title}</h2>
              {content}
            </div>
          )
        }
      )}

      <h1>German Locale</h1>
      {germanEntries.map(
        ({ sys: { id }, title, one, oneLocalized, many, manyLocalized }) => {
          const slug = slugify(title, { strict: true, lower: true })

          let content = null
          if (manyLocalized) {
            content = manyLocalized.map(imageData => (
              <img src={imageData.url} style={{ width: 200 }} alt={title} />
            ))
          }

          if (oneLocalized) {
            content = (
              <img src={oneLocalized.url} style={{ width: 200 }} alt={title} />
            )
          }

          if (many) {
            content = many.map(imageData => (
              <img src={imageData.url} style={{ width: 200 }} alt={title} />
            ))
          }

          if (one) {
            content = <img src={one.url} style={{ width: 200 }} alt={title} />
          }

          return (
            <div data-cy-id={`german-${slug}`} key={id}>
              <h2>{title}</h2>
              {content}
            </div>
          )
        }
      )}
    </Layout>
  )
}

export default MediaReferencePage

export const pageQuery = graphql`
  query MediaReferenceQuery {
    default: allContentfulMediaReference(
      sort: { fields: title }
      filter: {
        title: { glob: "!*Localized*" }
        sys: { locale: { eq: "en-US" } }
      }
    ) {
      nodes {
        title
        sys {
          id
        }
        one {
          url
        }
        many {
          url
        }
      }
    }
    english: allContentfulMediaReference(
      sort: { fields: title }
      filter: {
        title: { glob: "*Localized*" }
        sys: { locale: { eq: "en-US" } }
      }
    ) {
      nodes {
        title
        sys {
          id
        }
        one {
          url
        }
        many {
          url
        }
        oneLocalized {
          url
        }
        manyLocalized {
          url
        }
      }
    }
    german: allContentfulMediaReference(
      sort: { fields: title }
      filter: {
        title: { glob: "*Localized*" }
        sys: { locale: { eq: "de-DE" } }
      }
    ) {
      nodes {
        title
        sys {
          id
        }
        one {
          url
        }
        many {
          url
        }
        oneLocalized {
          url
        }
        manyLocalized {
          url
        }
      }
    }
  }
`
