import React from "react"
import moment from "moment"
import PostPublished from "../components/PostPublished"
import HelmetBlock from "../components/HelmetBlock"

class mdBlogPost extends React.Component {
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

export default mdBlogPost

export const pageQuery = graphql`
  query mdBlogPostBySlug($slug: String!) {
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
