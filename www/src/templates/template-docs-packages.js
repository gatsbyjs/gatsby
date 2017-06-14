import React from "react"

import { rhythm, scale } from "../utils/typography"
import presets from "../utils/presets"
import Container from "../components/container"

const DocsTemplate = React.createClass({
  render() {
    const packageName = this.props.data.markdownRemark.fields.title
    return (
      <Container>
        <a
          href={`https://github.com/gatsbyjs/gatsby/tree/1.0/packages/${packageName}`}
          css={{
            ...scale(-1 / 5),
            position: `absolute`,
          }}
        >
          Github
        </a>
        <div
          css={{
            position: `relative`,
            top: rhythm(-1 / 2),
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
