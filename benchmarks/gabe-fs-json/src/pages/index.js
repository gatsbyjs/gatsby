import React from "react"
import { Link, graphql } from "gatsby"

import Bio from "../components/bio"
import Layout from "../components/layout"

class BlogIndex extends React.Component {
  render() {
    const { data } = this.props
    const siteTitle = data.site.siteMetadata.title
    const posts = data.allGendataJson.edges

    return (
      <Layout location={this.props.location} title={siteTitle}>
        <Bio />
        {posts.map(({ node }) => {
          const title = node.title
          return (
            <article key={node.slug}>
              <header>
                <h3
                  style={{
                    marginBottom: '5px',
                  }}
                >
                  <Link style={{ boxShadow: `none` }} to={node.slug}>
                    {title}
                  </Link>
                </h3>
                <small>{node.date}</small>
              </header>
              <section>
                <p
                  dangerouslySetInnerHTML={{
                    __html: node.description,
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
    allGendataJson {
      edges {
        node {
          slug
          title
          description
          date(formatString: "MMMM DD, YYYY")
        }
      }
    }
  }
`
