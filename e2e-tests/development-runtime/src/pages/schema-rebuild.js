import React from "react"
import { graphql } from "gatsby"
import Layout from "../components/layout"
import InstrumentPage from "../utils/instrument-page"

const SchemaRebuildPage = ({ data }) => (
  <Layout>
    <p>{JSON.stringify(data)}</p>
  </Layout>
)

export default InstrumentPage(SchemaRebuildPage)

export const schemaRebuildQuery = graphql`
  {
    allMarkdownRemark {
      edges {
        node {
          frontmatter {
            title
            # foo
          }
        }
      }
    }
  }
`
