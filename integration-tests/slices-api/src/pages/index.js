import * as React from "react"
import { Link, graphql } from "gatsby"

import Layout from "../components/layout"


const BlogIndex = ({ data, location }) => {
  const siteTitle = data.site.siteMetadata?.title || `Title`
  const posts = data.allBlog.nodes

  return (
    <Layout location={location} title={siteTitle}>
      <ol style={{ listStyle: `none` }}>
        {posts.map(post => {
          const title = post.title

          return (
            <li key={post.slug}>
              <Link to={post.slug} itemProp="url">
                {title}
              </Link>
            </li>
          )
        })}
      </ol>
    </Layout>
  )
}

export default BlogIndex

export const pageQuery = graphql`
  query {
    site {
      siteMetadata {
        title
      }
    }
    allBlog {
      nodes {
        id
        slug
        content
        title
      }
    }
  }
`
