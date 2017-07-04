import React from "react"
import Helmet from "react-helmet"

import { rhythm, scale } from "../utils/typography"
import presets from "../utils/presets"
import Container from "../components/container"

const DocsTemplate = React.createClass({
  render() {
    const packageName = this.props.data.markdownRemark.fields.title
    const page = this.props.data.markdownRemark
    return (
      <Container>
        <Helmet
          title={page.fields.title}
          meta={[
            {
              name: `description`,
              content: page.excerpt,
            },
            {
              name: `og:description`,
              content: page.excerpt,
            },
            {
              name: `twitter:description`,
              content: page.excerpt,
            },
            {
              name: `og:title`,
              content: page.fields.title,
            },
            {
              name: `og:type`,
              content: `article`,
            },
            {
              name: `twitter:label1`,
              content: `Reading time`,
            },
            {
              name: `twitter:data1`,
              content: `${page.timeToRead} min read`,
            },
          ]}
        />
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
  query TemplateDocsPackages($slug: String!) {
    markdownRemark(fields: { slug: { eq: $slug } }) {
      html
      excerpt
      timeToRead
      fields {
        title
      }
    }
  }
`
