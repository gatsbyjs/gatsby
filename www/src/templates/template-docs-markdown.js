import React from "react"
import Helmet from "react-helmet"
import GithubIcon from "react-icons/lib/go/mark-github"

import { rhythm } from "../utils/typography"
import Container from "../components/container"

const DocsTemplate = React.createClass({
  render() {
    const page = this.props.data.markdownRemark
    return (
      <Container>
        <Helmet
          title={page.frontmatter.title}
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
              content: page.frontmatter.title,
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
        <h1 css={{ marginTop: 0 }}>
          {page.frontmatter.title}
        </h1>
        <div
          dangerouslySetInnerHTML={{
            __html: page.html,
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
      excerpt
      timeToRead
      frontmatter {
        title
      }
    }
  }
`
