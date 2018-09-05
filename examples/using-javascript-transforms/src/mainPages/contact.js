import { graphql } from "gatsby"
import React from "react"
import InsetPageLayout from "../components/Layouts/insetPage"

export const frontmatter = {
  layoutType: `page`,
  path: `/contact/`,
}

class ContactMe extends React.Component {
  render() {
    return (
      <InsetPageLayout {...this.props}>
        <div className="box container">
          <p>I would love to hear from you!</p>
        </div>
      </InsetPageLayout>
    )
  }
}

export default ContactMe

export const pageQuery = graphql`
  query {
    site {
      ...site_sitemetadata
    }
  }
`
