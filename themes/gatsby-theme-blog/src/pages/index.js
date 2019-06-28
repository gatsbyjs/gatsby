import React, { Fragment } from "react"
import { Link, graphql } from "gatsby"
import { Styled, css } from "theme-ui"

import Layout from "../components/layout"
import SEO from "../components/seo"
import Footer from "../components/home-footer"

const BlogIndex = ({
  location,
  data: {
    site: {
      siteMetadata: { title: siteTitle },
    },
    allMdx: { edges: posts },
  },
}) => (
  <Layout location={location} title={siteTitle}>
    <main>
      {posts.map(({ node }) => {
        const title = node.frontmatter.title || node.fields.slug
        const keywords = node.frontmatter.keywords || []
        return (
          <Fragment key={node.fields.slug}>
            <SEO title="Home" keywords={keywords} />
            <div>
              <Styled.h2
                css={css({
                  mb: 1,
                })}
              >
                <Styled.a
                  as={Link}
                  css={{
                    textDecoration: `none`,
                  }}
                  to={node.fields.slug}
                >
                  {title}
                </Styled.a>
              </Styled.h2>
              <small>{node.frontmatter.date}</small>
              <Styled.p>{node.excerpt}</Styled.p>
            </div>
          </Fragment>
        )
      })}
    </main>
    <Footer />
  </Layout>
)

export default BlogIndex

export const pageQuery = graphql`
  query {
    site {
      siteMetadata {
        title
      }
    }
    allMdx(
      sort: { fields: [frontmatter___date], order: DESC }
      filter: {
        fields: {
          source: { in: ["blog-default-posts", "blog-posts"] }
          slug: { ne: null }
        }
      }
    ) {
      edges {
        node {
          excerpt
          fields {
            slug
          }
          frontmatter {
            date(formatString: "MMMM DD, YYYY")
            title
          }
        }
      }
    }
  }
`
