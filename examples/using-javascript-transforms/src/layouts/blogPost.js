import React from "react"
import Link from "gatsby-link"
import Helmet from "react-helmet"
import moment from "moment"

import MasterLayout from "./master"

class BlogPostTemplate extends React.Component {
  render() {
    let siteMetadata = this.props.data.site.siteMetadata

    const home = (
      <div className="nav">
        <div className="container">
          <div className="nav-left">
            <Link className="nav-item is-tab is-active" to={`/`}>
              Home
            </Link>
          </div>
        </div>
      </div>
    )

    let published = <div className="date-published" />

    return (
      <div>
        <MasterLayout {...this.props}>
          {home}
          <div className="container">
            {this.props.children()}
          </div>
        </MasterLayout> 
      </div>
    )
  }
}

export default BlogPostTemplate

export const pageQuery = graphql`
query BlogPostLayoutBySlug {
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
