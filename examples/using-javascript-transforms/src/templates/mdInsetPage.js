import React from "react"
import { graphql } from "gatsby"
import InsetPageLayout from "../components/Layouts/insetPage"

function mdInsetPage({data}) {
  const { html } = data.markdownRemark

return (
<InsetPageLayout {...props}>
<div className="box container content">
<div dangerouslySetInnerHTML={{ __html: html }} />
</div>
</InsetPageLayout>
);
}

export default mdInsetPage

export const pageQuery = graphql`
  query($slug: String!) {
    markdownRemark(fields: { slug: { eq: $slug } }) {
      html
    }
    site {
      ...site_sitemetadata
    }
  }
`
