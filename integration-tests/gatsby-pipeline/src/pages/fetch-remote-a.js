import React from "react"
import { graphql, Link } from "gatsby"

import Layout from "../components/layout"
import SEO from "../components/seo"

const FetchRemoteA = ({ data }) => {
  return (
    <Layout>
      <SEO title="Fetch Remote A" />

      <pre
        dangerouslySetInnerHTML={{ __html: JSON.stringify(data, null, 2) }}
      />
      <Link to="/">Go back to the homepage</Link>
    </Layout>
  )
}

export default FetchRemoteA

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
