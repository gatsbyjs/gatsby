import React from "react"
import { graphql, Link } from "gatsby"

export default ({ data }) => {
  const { title, content, contentType, pagination } = data.wpContent

  return (
    <div>
      <h1>{title}</h1>
      <h2>
        {contentType} #{pagination.pageNumber}
      </h2>
      <Link to={pagination.previous.path}>
        Previous {pagination.previous.title}
      </Link>
      <br />
      <Link to={pagination.next.path}>Next {pagination.next.title}</Link>
      <p dangerouslySetInnerHTML={{ __html: content }} />
    </div>
  )
}

export const query = graphql`
  query index($ID: String!) {
    wpContent(id: { eq: $ID }) {
      title
      content
      contentType
      pagination {
        pageNumber
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
