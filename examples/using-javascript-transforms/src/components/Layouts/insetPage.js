import React from "react"
import { graphql } from "gatsby"
import SiteSidebar from "../SiteSidebar"
import MasterLayout from "./master"

function InsetPageLayout({children}) {
  return (
<div className="PageTemplate">
<MasterLayout {...props}>
<div className="section">
<div className="columns">
<div className="column is-one-quarter">
<SiteSidebar {...props} />
</div>
<div className="column">{children}</div>
</div>
</div>
</MasterLayout>
</div>
);
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
