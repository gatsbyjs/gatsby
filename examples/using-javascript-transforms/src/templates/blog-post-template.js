import React from "react"
import moment from "moment"
import PostPublished from "../components/PostPublished"
import HelmetBlock from "../components/HelmetBlock"

class mdBlogPostTemplate extends React.Component {
  render() {
    const {html, frontmatter} = this.props.data.markdownRemark

    return (
      <div className="blogPost">
        <HelmetBlock {...frontmatter} />
        <div className="content">
          <div className="section">
            <div className="container">
              {this.props.children()}
            </div>
          </div>
        </div>
        <PostPublished {...frontmatter} />
      </div>
    )
  }
}

export default mdBlogPostTemplate

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
