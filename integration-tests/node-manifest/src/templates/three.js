import { graphql } from "gatsby"
import React from "react"

export default function One({ data }) {
  return <div>Template 3. Node id {data.testNode.id}</div>
}

export const query = graphql`
  query {
    testNode(id: { eq: "3" }) {
      id
    }
    otherNode: testNode(id: { eq: "2" }) {
      id
    }
  }
`
