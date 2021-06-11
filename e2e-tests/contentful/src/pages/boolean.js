import { graphql } from "gatsby"
import * as React from "react"
import slugify from "slugify"

import Layout from "../components/layout"

const BooleanPage = ({ data }) => {
  const defaultEntries = data.default.nodes
  const englishEntries = data.english.nodes
  const germanEntries = data.german.nodes

  return (
    <Layout>
      <h1>Default</h1>
      {defaultEntries.map(({ title, boolean }) => {
        const slug = slugify(title, { strict: true, lower: true })
        return (
          <div data-cy-id={`default-${slug}`} key={slug}>
            <h2>{title}</h2>
            <p data-cy-value>{JSON.stringify(boolean)}</p>
          </div>
        )
      })}
      <h1>English Locale</h1>
      {englishEntries.map(({ title, booleanLocalized }) => {
        const slug = slugify(title, { strict: true, lower: true })
        return (
          <div data-cy-id={`english-${slug}`} key={slug}>
            <h2>{title}</h2>
            <p data-cy-value>{JSON.stringify(booleanLocalized)}</p>
          </div>
        )
      })}
      <h1>German Locale</h1>
      {germanEntries.map(({ title, booleanLocalized }) => {
        const slug = slugify(title, { strict: true, lower: true })
        return (
          <div data-cy-id={`german-${slug}`} key={slug}>
            <h2>{title}</h2>
            <p data-cy-value>{JSON.stringify(booleanLocalized)}</p>
          </div>
        )
      })}
    </Layout>
  )
}

export default BooleanPage

export const pageQuery = graphql`
  query BooleanQuery {
    default: allContentfulContentTypeBoolean(
      sort: { fields: sys___id }
      filter: {
        sys: { locale: { eq: "en-US" } }
        booleanLocalized: { eq: null }
      }
    ) {
      nodes {
        title
        boolean
      }
    }
    english: allContentfulContentTypeBoolean(
      sort: { fields: sys___id }
      filter: {
        sys: { locale: { eq: "en-US" } }
        booleanLocalized: { ne: null }
      }
    ) {
      nodes {
        title
        booleanLocalized
      }
    }
    german: allContentfulContentTypeBoolean(
      sort: { fields: sys___id }
      filter: {
        sys: { locale: { eq: "de-DE" } }
        booleanLocalized: { ne: null }
      }
    ) {
      nodes {
        title
        booleanLocalized
      }
    }
  }
`
