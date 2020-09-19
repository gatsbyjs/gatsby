import React from "react"
import { Link, graphql } from "gatsby"

import Bio from "../components/bio"
import Layout from "../components/layout"

class BlogPostTemplate extends React.Component {
  render() {
    const post = this.props.data
    const node = post.allGendataCsv.edges[0].node
    const siteTitle = this.props.data.site.siteMetadata.title
    const { previous, next } = this.props.pageContext

    return (
      <Layout location={this.props.location} title={siteTitle}>
        <article>
          <header>
            <h1
              style={{
                marginTop: '5px',
                marginBottom: 0,
              }}
            >
              {node.title}
            </h1>
            <p
              style={{
                display: `block`,
                marginBottom: '5px',
              }}
            >
              {node.date}
            </p>
          </header>
          <section dangerouslySetInnerHTML={{ __html: node.body }} />
          <hr
            style={{
              marginBottom: '5px',
            }}
          />
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
                <Link to={'../' + previous.slug} rel="prev">
                  ← {previous.title}
                </Link>
              )}
            </li>
            <li>
              {next && (
                <Link to={'../' + next.slug} rel="next">
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
  query($id: String!) {
    site {
      siteMetadata {
        title
      }
    }
    allGendataCsv(
      filter: {
         id: { eq: $id }
      }
    ) {
      edges {
        node {
          articleNumber
          title
          description
          slug
          date
          tags
          body
        }
      }
    }
  }
`;
