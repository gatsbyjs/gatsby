import React from "react"
import SiteSidebar from "../components/SiteSidebar"
import MasterLayout from "./master"


class InsetPageTemplate extends React.Component {
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
              <div className="column">
                {this.props.children()}
              </div>
            </div>
          </div>
        </MasterLayout>
      </div>
    )
  }
}

export default InsetPageTemplate

export const pageQuery = graphql`
query InsetLayoutBySlug {
  site {
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
}
`
