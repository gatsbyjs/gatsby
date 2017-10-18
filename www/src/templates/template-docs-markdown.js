import React from "react"
import Helmet from "react-helmet"
import gray from "gray-percentage"
import EditIcon from "react-icons/lib/md/create"

import Container from "../components/container"
import { rhythm, scale } from "../utils/typography"

class DocsTemplate extends React.Component {
  render() {
    const page = this.props.data.markdownRemark
    return (
      <Container>
        <Helmet>
          <title>{page.frontmatter.title}</title>
          <meta name="description" content={page.excerpt} />
          <meta name="og:description" content={page.excerpt} />
          <meta name="twitter:description" content={page.excerpt} />
          <meta name="og:title" content={page.frontmatter.title} />
          <meta name="og:type" content="article" />
          <meta name="twitter.label1" content="Reading time" />
          <meta name="twitter:data1" content={`${page.timeToRead} min read`} />
        </Helmet>
        <h1 css={{ marginTop: 0 }}>{page.frontmatter.title}</h1>
        <div
          dangerouslySetInnerHTML={{
            __html: page.html,
          }}
        />
        <a
          css={{
            "&&": {
              display: `block`,
              color: gray(60, 270),
              fontSize: scale(-1 / 5).fontSize,
              border: `none`,
              boxShadow: `none`,
              marginTop: rhythm(1.5),
            },
          }}
          href={`https://github.com/gatsbyjs/gatsby/blob/master/docs/${page
            .parent.relativePath}`}
        >
          <EditIcon
            css={{ fontSize: 20, position: `relative`, top: -2 }}
          />{` `}
          edit this page on Github
        </a>
      </Container>
    )
  }
}

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
      parent {
        ... on File {
          relativePath
        }
      }
    }
  }
`
