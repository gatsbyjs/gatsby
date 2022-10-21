import * as React from "react"
import { useStaticQuery, graphql } from "gatsby"
import { getImage, GatsbyImage } from "gatsby-plugin-image"

const Bio = ({data}) => {
  const { author, imageSharp } = data
  const avatar = getImage(imageSharp)

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

export const query = graphql`
  query BioByAuthorId(
    $id: String!
  ) {
    author(authorId: { eq: $id }) {
      name
      summary
      twitter
    }
  }
`

export default Bio
