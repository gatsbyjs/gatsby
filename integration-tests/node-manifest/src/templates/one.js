import { graphql } from "gatsby"
import React from "react"

export default function One({ data }) {
  return <div>Template 1. Node id {data.testNode.id}</div>
}

export const query = graphql`
  query {
    testNode(id: { eq: "1" }) {
      id
    }
    # querying this other node to make sure ownerNodeId in gatsby-node prevents this node from being the page owner
    otherNode: testNode(id: { eq: "2" }) {
      id
    }
  }
`
