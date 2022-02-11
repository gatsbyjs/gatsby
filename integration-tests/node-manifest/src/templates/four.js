import { graphql } from "gatsby"
import React from "react"

export default function Four({ data }) {
  return <div>Template 4. Node by slug {data.testNode.slug}</div>
}

export const query = graphql`
  query SLUG_TEST($slug: String) {
    testNode(slug: { eq: $slug }) {
      id
    }
    otherNode: testNode(id: { eq: "2" }) {
      id
    }
  }
`
