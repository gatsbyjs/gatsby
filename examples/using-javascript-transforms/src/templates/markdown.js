import React from "react"

class markdownTemplate extends React.Component {
  render() {
    const {html} = this.props.data.markdownRemark.data

    return (
      <div>
        <div dangerouslySetInnerHTML={{ __html: html }} />
      </div>
    )
  }
}

export default markdownTemplate

export const pageQuery = graphql`
  query markdownTemplateBySlug($slug: String!) {
    markdownRemark(fields: { slug: { eq: $slug } }) {
      html
    }
  }
`
