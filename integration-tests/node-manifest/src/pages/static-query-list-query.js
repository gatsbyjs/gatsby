import React from "react"
import { graphql } from "gatsby"

export default function TestConnectionStaticQueryListQueryType({ data }) {
  return (
    <div>
      <h1>TestConnectionStaticQueryListQueryType</h1>
      {data.allTestConnectionStaticQueryListQueryType.nodes.map(({ title }) => (
        <h2>{title}</h2>
      ))}
    </div>
  )
}

export const query = graphql`
  query TestConnectionStaticQueryListQueryType {
    allTestConnectionStaticQueryListQueryType {
      nodes {
        title
      }
    }
  }
`
