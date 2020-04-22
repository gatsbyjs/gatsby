import { graphql } from "gatsby"
import React from "react"
import Image from "gatsby-image"

export default ({ data }) => {
  const blogPost = data.cms.blogPost
  return (
    <div>
      {blogPost.titleImage &&
        blogPost.titleImage.imageFile &&
        blogPost.titleImage.imageFile.childImageSharp && (
          <Image fixed={blogPost.titleImage.imageFile.childImageSharp.fixed} />
        )}
      <h1>{blogPost.title}</h1>
      <div>Posted at: {blogPost.createdAt}</div>
      <div dangerouslySetInnerHTML={{ __html: blogPost.post }} />
    </div>
  )
}

export const query = graphql`
  query($blogId: ID!) {
    cms {
      blogPost(where: { id: $blogId }) {
        title
        createdAt
        post
        titleImage {
          url
          imageFile {
            childImageSharp {
              fixed {
                ...GatsbyImageSharpFixed
              }
            }
          }
        }
      }
    }
  }
`
