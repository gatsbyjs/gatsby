import React from "react"
import Helmet from "react-helmet"
import gray from "gray-percentage"
import EditIcon from "react-icons/lib/md/create"

import { rhythm, scale } from "../utils/typography"
import presets from "../utils/presets"
import Container from "../components/container"

class DocsPackagesTemplate extends React.Component {
  render() {
    const packageName = this.props.data.markdownRemark.fields.title
    const page = this.props.data.markdownRemark
    return (
      <Container>
        <Helmet>
          <title>{page.fields.title}</title>
          <meta name="description" content={page.excerpt} />
          <meta name="og:description" content={page.excerpt} />
          <meta name="twitter:description" content={page.excerpt} />
          <meta name="og:title" content={page.fields.title} />
          <meta name="og:type" content="article" />
          <meta name="twitter.label1" content="Reading time" />
          <meta name="twitter:data1" content={`${page.timeToRead} min read`} />
        </Helmet>
        <strong>
          <a
            href={`https://github.com/gatsbyjs/gatsby/tree/master/packages/${packageName}`}
            css={{
              position: `absolute`,
            }}
          >
            Browse source code for this package on Github
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
          href={`https://github.com/gatsbyjs/gatsby/blob/master/packages/${page
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

export default DocsPackagesTemplate

export const pageQuery = graphql`
  query TemplateDocsPackages($slug: String!) {
    markdownRemark(fields: { slug: { eq: $slug } }) {
      html
      excerpt
      timeToRead
      fields {
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
