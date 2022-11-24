import React from "react"
import { Link, graphql } from "gatsby"
import get from "lodash/get"
import { Helmet } from "react-helmet"

import Layout from "../components/layout"
import Bio from "../components/Bio"
import typography from "../utils/typography"

const { rhythm } = typography

class BlogIndex extends React.Component {
  render() {
    const siteTitle = get(this, `props.data.site.siteMetadata.title`)
    const posts = get(this, `props.data.allMarkdownRemark.edges`)

    return (
      <Layout location={this.props.location}>
        <Helmet title={siteTitle} />
        <Bio />
        {posts
          .filter(post => post.node.frontmatter.path !== `/404/`)
          .map(post => {
            const title = get(post, `node.frontmatter.title`) || post.node.path
            return (
              <div key={post.node.frontmatter.path}>
                <h3
                  style={{
                    marginBottom: rhythm(1 / 4),
                  }}
                >
                  <Link
                    style={{ boxShadow: `none` }}
                    to={post.node.frontmatter.path}
                  >
                    {title}
                  </Link>
                </h3>
                <small>{post.node.frontmatter.date}</small>
                <p dangerouslySetInnerHTML={{ __html: post.node.excerpt }} />
              </div>
            )
          })}
      </Layout>
    )
  }
}

export default BlogIndex

export const pageQuery = graphql`
  {
    site {
      siteMetadata {
        title
      }
    }
    allMarkdownRemark(sort: { frontmatter: { date: DESC } }) {
      edges {
        node {
          excerpt
          frontmatter {
            path
            date(formatString: "DD MMMM, YYYY")
          }
          frontmatter {
            title
          }
        }
      }
    }
  }
`
