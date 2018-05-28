import React from "react"
import SiteSidebar from "../SiteSidebar"
import MasterLayout from "./master"

class InsetPageLayout extends React.Component {
  render() {
    const siteMetadata = this.props.data.site

    return (
      <div className="PageTemplate">
        <MasterLayout {...this.props}>
          <div className="section">
            <div className="columns">
              <div className="column is-one-quarter">
                <SiteSidebar {...this.props} />
              </div>
              <div className="column">{this.props.children}</div>
            </div>
          </div>
        </MasterLayout>
      </div>
    )
  }
}

export default InsetPageLayout

export const pageQuery = graphql`
  fragment site_sitemetadata on Site {
    siteMetadata {
      title
      siteDescr
      siteAuthor
      siteEmailUrl
      siteEmailPretty
      siteTwitterUrl
      siteTwitterPretty
    }
  }
`
