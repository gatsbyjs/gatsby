/*
This is a temporary holdover until we can get queries on layouts. We only use markdown for posts
 so we just put some of the layout type things in here such as react-helmet and post publish comments.
*/

import React from "react"
import moment from "moment"
import PostPublished from "../components/PostPublished"
import HelmetBlock from "../components/HelmetBlock"

class markdownTemplate extends React.Component {
  render() {
    const data = this.props.data.markdownRemark
    const html = data.html
    const frontmatter = data.frontmatter

    return (
      <div>
        <HelmetBlock {...frontmatter} />
        <div className="content">
          <div className="markdown section">
            <div className="container content">
              <div dangerouslySetInnerHTML={{ __html: html }} />
            </div>
          </div>
        </div>
        <PostPublished {...frontmatter} />
      </div>
    )
  }
}

export default markdownTemplate

export const pageQuery = graphql`
  query markdownTemplateBySlug($slug: String!) {
    markdownRemark(fields: { slug: { eq: $slug } }) {
      html
      frontmatter {
        title
        path
        layoutType
        written
        updated
        what
        category
        description
      }
    }
  }
`
