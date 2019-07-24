import React from "react"
import { Helmet } from "react-helmet"
import { graphql } from "gatsby"
import { MDXRenderer } from "gatsby-plugin-mdx"

import Layout from "../components/layout"
import {
  itemListDocs,
  itemListTutorial,
  itemListContributing,
} from "../utils/sidebar/item-list"
import MarkdownPageFooter from "../components/markdown-page-footer"
import DocSearchContent from "../components/docsearch-content"
import FooterLinks from "../components/shared/footer-links"
import Breadcrumb from "../components/docs-breadcrumb"
import Container from "../components/container"
import PrevAndNext from "../components/prev-and-next"
import { space } from "../utils/presets"

const getDocsData = location => {
  const [urlSegment] = location.pathname.split(`/`).slice(1)
  const itemListLookup = {
    docs: itemListDocs,
    contributing: itemListContributing,
    tutorial: itemListTutorial,
  }

  return [urlSegment, itemListLookup[urlSegment]]
}

function DocsTemplate({ data, location, pageContext: { next, prev } }) {
  const page = data.mdx

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
            <Breadcrumb location={location} itemList={itemList} />
            <h1 id={page.fields.anchor} css={{ marginTop: 0 }}>
              {page.frontmatter.title}
            </h1>
            <MDXRenderer slug={page.fields.slug}>{page.body}</MDXRenderer>
            {page.frontmatter.issue && (
              <a
                href={page.frontmatter.issue}
                target="_blank"
                rel="noopener noreferrer"
              >
                See the issue relating to this stub on GitHub
              </a>
            )}
            <PrevAndNext
              css={{ marginTop: space[9] }}
              prev={prev}
              next={next}
            />
            <MarkdownPageFooter page={page} />
          </Container>
        </DocSearchContent>
        <FooterLinks />
      </Layout>
    </>
  )
}

export default DocsTemplate

export const pageQuery = graphql`
  query($path: String!) {
    mdx(fields: { slug: { eq: $path } }) {
      body
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
      ...MarkdownPageFooterMdx
    }
  }
`
