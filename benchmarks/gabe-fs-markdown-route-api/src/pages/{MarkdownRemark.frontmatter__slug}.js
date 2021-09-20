import React from "react"
import { Link, graphql } from "gatsby"

import Bio from "../components/bio"
import Layout from "../components/layout"

class BlogPostTemplate extends React.Component {
  render() {
    const {
      html,
      frontmatter: { title, date },
    } = this.props.data.markdownRemark
    const siteTitle = this.props.data.site.siteMetadata.title
    const { previous, next } = this.props.pageContext

    return (
      <Layout location={this.props.location} title={siteTitle}>
        <article>
          <header>
            <h1 style={{ marginTop: "5px", marginBottom: 0 }}>{title}</h1>
            <p style={{ display: `block`, marginBottom: "5px" }}>{date}</p>
          </header>
          <section dangerouslySetInnerHTML={{ __html: html }} />
          <hr style={{ marginBottom: "5px" }} />
          <footer>
            <Bio />
          </footer>
        </article>

        <nav>
          {/* At the time of creating this benchmark there wasn't an API available to easily pass additional data via pageContext, e.g. for this prev/next use case.
              So "previous" and "next" will be undefined here
           */}
          <ul
            style={{
              display: `flex`,
              flexWrap: `wrap`,
              justifyContent: `space-between`,
              listStyle: `none`,
              padding: 0,
            }}
          >
            <li>
              {previous && (
                <Link to={"/" + previous.frontmatter.slug} rel="prev">
                  ← {previous.frontmatter.title}
                </Link>
              )}
            </li>
            <li>
              {next && (
                <Link to={"/" + next.frontmatter.slug} rel="next">
                  {next.frontmatter.title} →
                </Link>
              )}
            </li>
          </ul>
        </nav>
      </Layout>
    )
  }
}

export default BlogPostTemplate

export const pageQuery = graphql`
  query BlogPostById($id: String!) {
    site {
      siteMetadata {
        title
      }
    }
    markdownRemark(id: { eq: $id }) {
      html
      frontmatter {
        title
        date(formatString: "MMMM DD, YYYY")
      }
    }
  }
`
