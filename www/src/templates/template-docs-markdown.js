import React from "react"
import Helmet from "react-helmet"
import { graphql } from "gatsby"

import Layout from "../components/layout"
import {
  createLinkDocs,
  createLinkTutorial,
} from "../utils/sidebar/create-link"
import {
  sectionListDocs,
  sectionListTutorial,
} from "../utils/sidebar/section-list"
import MarkdownPageFooter from "../components/markdown-page-footer"
import DocSearchContent from "../components/docsearch-content"

import Container from "../components/container"

class DocsTemplate extends React.Component {
  render() {
    const page = this.props.data.markdownRemark
    const isDocsPage = this.props.location.pathname.slice(0, 5) === `/docs`
    return (
      <React.Fragment>
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
        <Layout
          location={this.props.location}
          isSidebarDisabled={
            this.props.location.pathname === `/code-of-conduct/`
          }
          sectionList={isDocsPage ? sectionListDocs : sectionListTutorial}
          createLink={isDocsPage ? createLinkDocs : createLinkTutorial}
          enableScrollSync={isDocsPage ? false : true}
        >
          <DocSearchContent>
            <Container>
              <h1 id={page.fields.anchor} css={{ marginTop: 0 }}>
                {page.frontmatter.title}
              </h1>
              <div
                dangerouslySetInnerHTML={{
                  __html: page.html,
                }}
              />
              <MarkdownPageFooter page={page} />
            </Container>
          </DocSearchContent>
        </Layout>
      </React.Fragment>
    )
  }
}

export default DocsTemplate

export const pageQuery = graphql`
  query($path: String!) {
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
