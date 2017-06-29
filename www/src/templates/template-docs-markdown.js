import React from "react"

import { rhythm } from "../utils/typography"
import Container from "../components/container"

const DocsTemplate = React.createClass({
  render() {
    return (
      <Container>
        <h1 css={{ marginTop: 0 }}>
          {this.props.data.markdownRemark.frontmatter.title}
        </h1>
        <div
          dangerouslySetInnerHTML={{
            __html: this.props.data.markdownRemark.html,
          }}
        />
      </Container>
    )
  },
})

export default DocsTemplate

export const pageQuery = graphql`
  query TemplateDocsMarkdown($slug: String!) {
    markdownRemark(fields: { slug: { eq: $slug } }) {
      html
      frontmatter {
        title
      }
    }
  }
`
