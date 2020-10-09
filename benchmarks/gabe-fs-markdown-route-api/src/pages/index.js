import React from "react"
import { Link, graphql } from "gatsby"

import Bio from "../components/bio"
import Layout from "../components/layout"

class BlogIndex extends React.Component {
  render() {
    const { data } = this.props
    const siteTitle = data.site.siteMetadata.title
    const posts = data.allMarkdownRemark.nodes

    return (
      <Layout location={this.props.location} title={siteTitle}>
        <Bio />
        {posts.map(({ frontmatter: { title, slug, date, description }, gatsbyPath }) => {
          return (
            <article key={slug}>
              <header>
                <h3
                  style={{
                    marginBottom: "5px",
                  }}
                >
                  <Link style={{ boxShadow: `none` }} to={gatsbyPath}>
                    {title}
                  </Link>
                </h3>
                <small>{date}</small>
              </header>
              <section>
                <p
                  dangerouslySetInnerHTML={{
                    __html: description,
                  }}
                />
              </section>
            </article>
          )
        })}
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
    allMarkdownRemark(
      limit: 100
      sort: { fields: frontmatter___date, order: DESC }
    ) {
      nodes {
        gatsbyPath(filePath: "/{MarkdownRemark.frontmatter__slug}")
        frontmatter {
          title
          slug
          date(formatString: "MMMM DD, YYYY")
          description
        }
      }
    }
  }
`
