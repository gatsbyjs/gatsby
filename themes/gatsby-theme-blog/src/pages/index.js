import React from "react"
import { Link, graphql } from "gatsby"
import { Styled, css } from "theme-ui"

import Bio from "../components/bio"
import Layout from "../components/layout"
import SEO from "../components/seo"
import Footer from "../components/footer"

class BlogIndex extends React.Component {
  render() {
    const { data } = this.props
    const siteTitle = data.site.siteMetadata.title
    const posts = data.allMdx.edges

    return (
      <Layout location={this.props.location} title={siteTitle}>
        <SEO
          title="amberley dot blog"
          keywords={[`blog`, `gatsby`, `javascript`, `react`]}
        />
        <Bio />
        {posts.map(({ node }) => {
          const title = node.frontmatter.title || node.fields.slug
          return (
            <div key={node.fields.slug}>
              <Styled.h2
                css={css({
                  mb: 1,
                })}
              >
                <Link css={{ boxShadow: `none` }} to={node.fields.slug}>
                  {title}
                </Link>
              </Styled.h2>
              <small>{node.frontmatter.date}</small>
              <Styled.p>{node.excerpt}</Styled.p>
            </div>
          )
        })}
        <Footer />
      </Layout>
    )
  }
}

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
