import React from "react"
import { Link, graphql } from "gatsby"

import Bio from "../components/bio"
import Layout from "../components/layout"

class BlogPostTemplate extends React.Component {
  render() {
    const { title, date, html, description } = this.props.data.gendataCsv
    const siteTitle = this.props.data.site.siteMetadata.title

    const { previous, next } = this.props.pageContext

    return (
      <Layout location={this.props.location} title={siteTitle}>
        <article>
          <header>
            <h1 style={{ marginTop: "5px", marginBottom: 0 }}>{title}</h1>
            <p style={{ display: `block`, marginBottom: "5px" }}>{date}</p>
          </header>
          <section>
            <blockquote dangerouslySetInnerHTML={{ __html: description }} />
            <div dangerouslySetInnerHTML={{ __html: html }} />
          </section>
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
                  ← {previous.title}
                </Link>
              )}
            </li>
            <li>
              {next && (
                <Link to={"/" + next.slug} rel="next">
                  {next.title} →
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
    gendataCsv(id: { eq: $id }) {
      title
      description
      date(formatString: "MMMM DD, YYYY")
      html
    }
  }
`
