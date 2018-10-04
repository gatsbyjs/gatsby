import React from "react"
import { graphql } from "gatsby"

export default ({ data }) => {
  const node = data.testNode
  return (
    <div>
      <h1>{node.id}. Not much ey</h1>
    </div>
  )
}

export const query = graphql`
  query testing($id: String!) {
    testNode(internal: { nestedId: { eq: $id } }) {
      id
    }
  }
`
