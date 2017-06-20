import React from "react"

import { rhythm, scale } from "../utils/typography"
import presets from "../utils/presets"
import Container from "../components/container"

const DocsTemplate = React.createClass({
  render() {
    const packageName = this.props.data.markdownRemark.fields.title
    return (
      <Container>
        <strong>
          <a
            href={`https://github.com/gatsbyjs/gatsby/tree/1.0/packages/${packageName}`}
            css={{
              position: `absolute`,
            }}
          >
            Browse source code for package on Github
          </a>
        </strong>
        <div
          css={{
            position: `relative`,
          }}
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
  query TemplateDocsQuery($slug: String!) {
    markdownRemark(fields: { slug: { eq: $slug }}) {
      fields {
        title
      }
      html
    }
  }
`
