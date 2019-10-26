import React from "react"
import { graphql, Link } from "gatsby"

export default ({ data }) => {
  const { title, content, pagination } = data.wpContent

  console.log(pagination)
  return (
    <div>
      <h1>{title}</h1>
      <Link to={pagination.next.path}>{pagination.next.title}</Link>
      <br />
      <Link to={pagination.previous.path}>{pagination.previous.title}</Link>
      <p dangerouslySetInnerHTML={{ __html: content }} />
    </div>
  )
}

export const query = graphql`
  query index($ID: String!) {
    wpContent(id: { eq: $ID }) {
      title
      content
      pagination {
        next {
          path
          title
        }
        previous {
          path
          title
        }
      }
    }
  }
`
