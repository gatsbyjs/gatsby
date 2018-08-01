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

import docsHierarchy from "../data/sidebars/doc-links.yaml"

// I’m doing some gymnastics here that I can only hope you’ll forgive me for.
// Find the guides in the sidebar YAML.
const guides = docsHierarchy.find(group => group.title === `Guides`).items

// Finds child items for a given guide overview page using its slug.
const getChildGuides = slug => guides.find(guide => guide.link === slug).items

// Create a table of contents from the child guides.
const createGuideList = guides =>
  guides
    .map(guide => `<li><a href="${guide.link}">${guide.title}</a></li>`)
    .join(``)

const getPageHTML = page => {
  if (!page.frontmatter.overview) {
    return page.html
  }

  const guides = getChildGuides(page.fields.slug)
  const guideList = createGuideList(guides)
  const toc = `
    <h2>Guides in this section:</h2>
    <ul>${guideList}</ul>
  `

  // This is probably a capital offense in Reactland. 😱😱😱
  return page.html.replace(`[[guidelist]]`, toc)
}

class DocsTemplate extends React.Component {
  render() {
    const page = this.props.data.markdownRemark
    const isDocsPage = this.props.location.pathname.slice(0, 5) === `/docs`
    const html = getPageHTML(page)

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
                  __html: html,
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
        overview
      }
      ...MarkdownPageFooter
    }
  }
`
