import React from "react"
import { graphql } from "gatsby"

import Layout from "../components/layout"

function NotFoundPage({location, data}) {
  const siteTitle = data.site.siteMetadata.title

return (
<Layout location={location} title={siteTitle}>
<h1>Not Found</h1>
<p>You just hit a route that doesn&#39;t exist... the sadness.</p>
</Layout>
);
}

export default NotFoundPage

export const pageQuery = graphql`
  query {
    site {
      siteMetadata {
        siteTitle
      }
    }
  }
`
