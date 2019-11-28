import React from "react"
import { graphql, Link } from "gatsby"

export default ({ data }) => {
  const { title, content } = data.wpPost

  return (
    <div>
      <Link to="/">home</Link>
      <h1>Page: {title}</h1>

      <p dangerouslySetInnerHTML={{ __html: content }} />
    </div>
  )
}

export const query = graphql`
  query page($id: String!) {
    wpPage(id: { eq: $id }) {
      title
      content
    }
  }
`
