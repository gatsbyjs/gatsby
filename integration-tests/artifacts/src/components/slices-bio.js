import React from "react"
import { graphql } from "gatsby"

export default function SlicesBio({ data: { sliceBlogPostAuthor: author } }) {
  return (
    <div className="bio">
      <p>
        Written by <strong>{author.name}</strong> {author?.summary || null}
        {` `}
        <a href={`https://twitter.com/${author?.twitter || ``}`}>
          You should follow them on Twitter
        </a>
      </p>
    </div>
  )
}

export const pageQuery = graphql`
  query BioByAuthorId($id: String!) {
    sliceBlogPostAuthor(id: { eq: $id }) {
      name
      summary
      twitter
    }
  }
`
