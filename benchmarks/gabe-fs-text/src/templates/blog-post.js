import React from "react"
import { Link, graphql } from "gatsby"

import Bio from "../components/bio"
import Layout from "../components/layout"

class BlogPostTemplate extends React.Component {
  render() {
    const { date, html } = this.props.data.texto
    const siteTitle = this.props.data.site.siteMetadata.title

    const { previous, next } = this.props.pageContext

    return (
      <Layout location={this.props.location} title={siteTitle}>
        <article>
          <header>
            <p style={{ display: `block`, marginBottom: "5px" }}>{date}</p>
          </header>
          <section dangerouslySetInnerHTML={{ __html: html }} />
          <hr style={{ marginBottom: "5px" }} />
          <footer>
            <Bio />
          </footer>
        </article>

        <nav>
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
                <Link to={"/" + previous.slug} rel="prev">
                  ← {previous.slug}
                </Link>
              )}
            </li>
            <li>
              {next && (
                <Link to={"/" + next.slug} rel="next">
                  {next.slug} →
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
  query SitePageById($id: String!) {
    site {
      siteMetadata {
        title
      }
    }
    texto(id: { eq: $id }) {
      title
      description
      date(formatString: "MMMM DD, YYYY")
      html
    }
  }
`
