import React from "react"
import InsetPageLayout from "../components/Layouts/insetPage"

class mdInsetPage extends React.Component {
  render() {
    const { html } = this.props.data.markdownRemark

    return (
      <InsetPageLayout {...this.props}>
        <div className="box container content">
          <div dangerouslySetInnerHTML={{ __html: html }} />
        </div>
      </InsetPageLayout>
    )
  }
}

export default mdInsetPage

export const pageQuery = graphql`
  query markdownTemplateBySlug($slug: String!) {
    markdownRemark(fields: { slug: { eq: $slug } }) {
      html
    }
    site {
      ...site_sitemetadata
    }
  }
`
