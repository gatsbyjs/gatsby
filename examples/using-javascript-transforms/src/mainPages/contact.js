import { graphql } from "gatsby"
import React from "react"
import InsetPageLayout from "../components/Layouts/insetPage"

export const frontmatter = {
  layoutType: `page`,
  path: `/contact/`,
}

function ContactMe() {
  return (
<InsetPageLayout {...props}>
<div className="box container">
<p>I would love to hear from you!</p>
</div>
</InsetPageLayout>
);
}

export default ContactMe

export const pageQuery = graphql`
  query {
    site {
      ...site_sitemetadata
    }
  }
`
