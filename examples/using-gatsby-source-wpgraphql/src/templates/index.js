import React from "react"
import { graphql } from "gatsby"

export default ({ data }) => {
  const { title, content } = data.contentNode
  return (
    <div>
      <h1>{title}</h1>
      <p dangerouslySetInnerHTML={{ __html: content }} />
    </div>
  )
}

export const query = graphql`
  query index($ID: String!) {
    contentNode(id: { eq: $ID }) {
      title
      content
    }
  }
`
