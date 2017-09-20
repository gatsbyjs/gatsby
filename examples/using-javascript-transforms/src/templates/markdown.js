import React from "react"

class mdTemplate extends React.Component {
  render() {
    const {html} = this.props.data.markdownRemark

    return (
        <div className="container content">
          <div dangerouslySetInnerHTML={{ __html: html }} />
        </div>
    )
  }
}

export default mdBlogPostTemplate

export const pageQuery = graphql`
  query markdownTemplateBySlug($slug: String!) {
    markdownRemark(fields: { slug: { eq: $slug } }) {
      html
    }
  }
`
