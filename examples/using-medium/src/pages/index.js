import React from "react"
import { graphql } from "gatsby"
import Layout from "../components/layout"

const mediumCDNUrl = `https://cdn-images-1.medium.com/max/150/`

const IndexPage = ({ data }) => {
  const posts = data.allMediumPost.edges

  return (
    <Layout>
      <main>
        {posts.map(post => (
          <article key={post.node.id}>
            <h2>{post.node.title}</h2>
            <h3>by {post.node.author.name}</h3>
            <img
              src={`${mediumCDNUrl}/${post.node.virtuals.previewImage.imageId}`}
              alt={post.node.title}
              width="150"
            />
          </article>
        ))}
      </main>
    </Layout>
  )
}

export default IndexPage

// Increase the `limit` parameter to get more posts
export const pageQuery = graphql`
  {
    allMediumPost(limit: 5, sort: { createdAt: DESC }) {
      edges {
        node {
          id
          title
          author {
            name
          }
          virtuals {
            previewImage {
              imageId
            }
          }
        }
      }
    }
  }
`
