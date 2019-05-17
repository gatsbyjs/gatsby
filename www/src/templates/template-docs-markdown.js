import React from "react"
import { Helmet } from "react-helmet"
import { graphql } from "gatsby"

import Layout from "../components/layout"
import {
  itemListDocs,
  itemListTutorial,
  itemListContributing,
} from "../utils/sidebar/item-list"
import MarkdownPageFooter from "../components/markdown-page-footer"
import DocSearchContent from "../components/docsearch-content"
import FooterLinks from "../components/shared/footer-links"

import Container from "../components/container"

import docsHierarchy from "../data/sidebars/doc-links.yaml"

// Search through tree, which may be 2, 3 or more levels deep
const childItemsBySlug = (docsHierarchy, slug) => {
  let result

  const iter = a => {
    if (a.link === slug) {
      result = a
      return true
    }
    return Array.isArray(a.items) && a.items.some(iter)
  }

  docsHierarchy.some(iter)
  return result && result.items
}

const getPageHTML = page => {
  const subitemsForPage =
    childItemsBySlug(docsHierarchy, page.fields.slug) || []
  const subitemList = subitemsForPage
    .map(subitem => `<li><a href="${subitem.link}">${subitem.title}</a></li>`)
    .join(``)
  const toc = subitemList
    ? `
    <h2>In this section:</h2>
    <ul>${subitemList}</ul>
  `
    : ``

  // This is probably a capital offense in Reactland. 😱😱😱
  return page.html.replace(`[[guidelist]]`, toc)
}

const getDocsData = location => {
  const [urlSegment] = location.pathname.split(`/`).slice(1)
  const itemListLookup = {
    docs: itemListDocs,
    contributing: itemListContributing,
    tutorial: itemListTutorial,
  }

  return [urlSegment, itemListLookup[urlSegment]]
}

function DocsTemplate({ data, location }) {
  const page = data.markdownRemark
  const html = getPageHTML(page)

  const [urlSegment, itemList] = getDocsData(location)

  return (
    <>
      <Helmet>
        <title>{page.frontmatter.title}</title>
        <meta name="description" content={page.excerpt} />
        <meta property="og:description" content={page.excerpt} />
        <meta property="og:title" content={page.frontmatter.title} />
        <meta property="og:type" content="article" />
        <meta name="twitter:description" content={page.excerpt} />
        <meta name="twitter.label1" content="Reading time" />
        <meta name="twitter:data1" content={`${page.timeToRead} min read`} />
      </Helmet>
      <Layout
        location={location}
        itemList={itemList}
        enableScrollSync={urlSegment === `docs` ? false : true}
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
            {page.frontmatter.issue && (
              <a
                href={page.frontmatter.issue}
                target="_blank"
                rel="noopener noreferrer"
              >
                See the issue relating to this stub on GitHub
              </a>
            )}
            <MarkdownPageFooter page={page} />
            <FooterLinks />
          </Container>
        </DocSearchContent>
      </Layout>
    </>
  )
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
        issue
      }
      ...MarkdownPageFooter
    }
  }
`
