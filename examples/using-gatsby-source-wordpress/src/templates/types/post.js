import React from "react"
import { graphql, Link } from "gatsby"

export default ({ data }) => {
  const { title, content } = data.wpPost

  return (
    <div>
      <Link to="/">home</Link>
      <h1>Post: {title}</h1>

      <p dangerouslySetInnerHTML={{ __html: content }} />
    </div>
  )
}

export const query = graphql`
  query post($id: String!) {
    wpPost(id: { eq: $id }) {
      title
      content
    }
  }
`
