import React from "react"
import Helmet from "react-helmet"

import Layout from "../components/layout"
import docsSidebar from "../pages/docs/doc-links.yaml"
import tutorialSidebar from "../pages/docs/tutorial-links.yml"
import MarkdownPageFooter from "../components/markdown-page-footer"
import DocSearchContent from "../components/docsearch-content"

import Container from "../components/container"
import { rhythm } from "../utils/typography"

class DocsTemplate extends React.Component {
  render() {
    const page = this.props.data.markdownRemark
    return (
      <Layout
        location={this.props.location}
        isSidebarDisabled={
          this.props.location.pathname === `/community/` ||
          this.props.location.pathname === `/code-of-conduct/`
        }
        sidebarYaml={
          this.props.location.pathname.slice(0, 5) === `/docs`
            ? docsSidebar
            : tutorialSidebar
        }
      >
        <DocSearchContent>
          <Container>
            <div
              css={{
                paddingLeft: rhythm(2),
              }}
            >
              <Helmet>
                <title>{page.frontmatter.title}</title>
                <meta name="description" content={page.excerpt} />
                <meta name="og:description" content={page.excerpt} />
                <meta name="twitter:description" content={page.excerpt} />
                <meta name="og:title" content={page.frontmatter.title} />
                <meta name="og:type" content="article" />
                <meta name="twitter.label1" content="Reading time" />
                <meta
                  name="twitter:data1"
                  content={`${page.timeToRead} min read`}
                />
              </Helmet>
              <h1 id={page.fields.anchor} css={{ marginTop: 0 }}>
                {page.frontmatter.title}
              </h1>
              <div
                dangerouslySetInnerHTML={{
                  __html: page.html,
                }}
              />
              <MarkdownPageFooter page={page} />
            </div>
          </Container>
        </DocSearchContent>
      </Layout>
    )
  }
}

export default DocsTemplate

export const pageQuery = graphql`
  query TemplateDocsMarkdown($path: String!) {
    markdownRemark(fields: { slug: { eq: $path } }) {
      html
      excerpt
      timeToRead
      fields {
        slug
        anchor
      }
      frontmatter {
        title
      }
      ...MarkdownPageFooter
    }
  }
`
