import React from "react"
import * as PropTypes from "prop-types"
import Helmet from "react-helmet"
import "../static/css/base.scss"

import InsetPage from "./inset-page"
import BlogPost from "./blog-post"

class MasterLayout extends React.Component {
  render() {
    let siteMetadata = this.props.data.allSite.edges[0].node.siteMetadata
    let location = this.props.location.pathname
    let jimmyPage // you jimmy a lock until it opens, so same thing here ;)

    // let dataSource = this.props.pageResources.json.data
    // let nodeType = dataSource.jsFrontmatter || dataSource.markdownRemark
    // let frontmatter = nodeType.data || nodeType.frontmatter
    let passdown = {
      // frontmatter: frontmatter,
      location: this.props.location,
      siteMetadata: siteMetadata,
      children: this.props.children,
    }
    if (location === `/` || location === `/contact`) {
      jimmyPage = <InsetPage {...passdown} />
    } else {
      jimmyPage = <BlogPost {...passdown} />
    }

    return (
      <div className="MasterLayout">
        <Helmet
          defaultTitle={siteMetadata.title}
          meta={[
            { name: `description`, content: siteMetadata.siteDescr },
            { name: `keywords`, content: `articles` },
          ]}
        />
        {jimmyPage}
      </div>
    )
  }
}

export default MasterLayout

export const pageQuery = graphql`
  query LayoutBySlug {
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
