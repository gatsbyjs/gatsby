import * as React from "react"
import { Link, graphql, Slice } from "gatsby"

const BlogIndex = ({ data }) => {
  const posts = data.allSliceBlogPost.nodes

  return (
    <Slice alias="layout" size="large">
      <ol style={{ listStyle: `none` }}>
        {posts.map(post => {
          const title = post.title

          return (
            <li key={post.slug}>
              <Link to={`/slices/${post.slug}`} itemProp="url">
                {title}
              </Link>
            </li>
          )
        })}
      </ol>
    </Slice>
  )
}

export default BlogIndex

export const pageQuery = graphql`
  query {
    allSliceBlogPost {
      nodes {
        id
        slug
        content
        title
      }
    }
  }
`
