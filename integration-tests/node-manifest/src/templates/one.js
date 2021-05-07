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
  }
`
