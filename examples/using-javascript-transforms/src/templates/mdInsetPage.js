import React from "react"

class mdInsetPage extends React.Component {
  render() {
    const { html } = this.props.data.markdownRemark

    return (
      <div className="box container content">
        <div dangerouslySetInnerHTML={{ __html: html }} />
      </div>
    )
  }
}

export default mdInsetPage

export const pageQuery = graphql`
  query markdownTemplateBySlug($slug: String!) {
    markdownRemark(fields: { slug: { eq: $slug } }) {
      html
    }
  }
`
