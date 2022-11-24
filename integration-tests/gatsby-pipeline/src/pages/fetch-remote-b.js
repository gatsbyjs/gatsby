import React from "react"
import { graphql, Link } from "gatsby"

import Layout from "../components/layout"
import SEO from "../components/seo"

const FetchRemoteB = ({ data }) => {
  return (
    <Layout>
      <SEO title="Fetch Remote B" />

      <pre
        dangerouslySetInnerHTML={{ __html: JSON.stringify(data, null, 2) }}
      />

      <Link to="/">Go back to the homepage</Link>
    </Layout>
  )
}

export default FetchRemoteB

export const pageQuery = graphql`
  {
    allMyRemoteFile {
      nodes {
        url
        publicUrl
      }
    }
  }
`
