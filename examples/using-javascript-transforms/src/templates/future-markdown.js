/*
We don't actually use this component at all.
I would like to eventually use this as templates should really
 only be concerned about converting non-react (markdown -> html here) into
 a react component that we can use.


import React from "react"

class markdownTemplate extends React.Component {
  render() {
    const data = this.props.data.markdownRemark

    return (
      <div className="content">
        <div className="markdown section">
          <div className="container content">
            <div dangerouslySetInnerHTML={{ __html: data.html }} />
          </div>
        </div>
      </div>
    )
  }
}

export default markdownTemplate

export const pageQuery = graphql`
  query futuremarkdownTemplateBySlug($slug: String!) {
    markdownRemark(fields: { slug: { eq: $slug } }) {
      html
      frontmatter {
        title
        written
        updated
        layoutType
        path
        category
        description
      }
    }
  }
`
*/