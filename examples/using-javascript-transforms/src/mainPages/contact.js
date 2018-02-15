import React from "react"
import Helmet from "react-helmet"
import SiteLinks from "../components/SiteLinks"
import InsetPageLayout from "../components/Layouts/insetPage"

exports.frontmatter = {
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
  query contactUs {
    site {
      ...site_sitemetadata
    }
  }
`
