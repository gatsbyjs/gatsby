import React from "react"
import { graphql } from "gatsby"

export default function ConnectionListQueryPage({ data }) {
  return (
    <div>
      <h1>ConnectionListQueryPage</h1>
      {data.allTestConnectionListQueryType.nodes.map(({ title }) => (
        <h2>{title}</h2>
      ))}
    </div>
  )
}

export const query = graphql`
  query ConnectionListQueryPage {
    allTestConnectionListQueryType {
      nodes {
        title
      }
    }
  }
`
