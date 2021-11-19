import { graphql } from "gatsby"
import * as React from "react"
import slugify from "slugify"

import Layout from "../components/layout"

const NumberPage = ({ data }) => {
  const defaultEntries = data.default.nodes
  const englishEntries = data.english.nodes
  const germanEntries = data.german.nodes
  return (
    <Layout>
      {defaultEntries.map(({ title, integer, decimal }) => {
        const slug = slugify(title, { strict: true, lower: true })
        return (
          <div data-cy-id={slug} key={slug}>
            <h2>{title}</h2>
            <p data-cy-value>{integer ? integer : decimal}</p>
          </div>
        )
      })}

      <h1>English Locale</h1>
      {englishEntries.map(({ title, integerLocalized, decimalLocalized }) => {
        const slug = slugify(title, { strict: true, lower: true })
        return (
          <div data-cy-id={`english-${slug}`} key={slug}>
            <h2>{title}</h2>
            <p data-cy-value>
              {integerLocalized ? integerLocalized : decimalLocalized}
            </p>
          </div>
        )
      })}

      <h1>German Locale</h1>
      {germanEntries.map(({ title, integerLocalized, decimalLocalized }) => {
        const slug = slugify(title, { strict: true, lower: true })
        return (
          <div data-cy-id={`german-${slug}`} key={slug}>
            <h2>{title}</h2>
            <p data-cy-value>
              {integerLocalized ? integerLocalized : decimalLocalized}
            </p>
          </div>
        )
      })}
    </Layout>
  )
}

export default NumberPage

export const pageQuery = graphql`
  query NumberQuery {
    default: allContentfulNumber(
      sort: { fields: contentful_id }
      filter: { title: { glob: "!*Localized*" }, node_locale: { eq: "en-US" } }
    ) {
      nodes {
        title
        integer
        decimal
      }
    }
    english: allContentfulNumber(
      sort: { fields: contentful_id }
      filter: { title: { glob: "*Localized*" }, node_locale: { eq: "en-US" } }
    ) {
      nodes {
        title
        integerLocalized
        decimalLocalized
      }
    }
    german: allContentfulNumber(
      sort: { fields: contentful_id }
      filter: { title: { glob: "*Localized*" }, node_locale: { eq: "de-DE" } }
    ) {
      nodes {
        title
        integerLocalized
        decimalLocalized
      }
    }
  }
`
