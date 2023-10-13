import { graphql } from "gatsby"
import * as React from "react"

import Layout from "../components/layout"

const CustomFieldsPage = ({ data }) => {
  const {
    contentfulContentTypeText
  } = data
  return (
    <Layout>
      <h2>Custom Field:</h2>
      <div data-cy-id="field">
        <p data-cy-value>{contentfulContentTypeText.fields.customField}</p>
      </div>
      <h2>Custom Resolver:</h2>
      <div data-cy-id="resolver">
        <p data-cy-value>{contentfulContentTypeText.customResolver}</p>
      </div>
    </Layout>
  )
}

export default CustomFieldsPage

export const pageQuery = graphql`
  query TextQuery {
    contentfulContentTypeText {
      fields {
        customField
      }
      customResolver
    }
  }
`
