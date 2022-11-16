import React from "react"
import { graphql } from "gatsby"
import { useStaticQuery } from "gatsby"

export default function TestConnectionStaticQueryListQueryType() {
  const data = useStaticQuery(graphql`
    query TestConnectionStaticQueryListQueryType {
      allTestConnectionStaticQueryListQueryType {
        nodes {
          title
        }
      }
    }
  `)

  return (
    <div>
      <h1>TestConnectionStaticQueryListQueryType</h1>
      {data.allTestConnectionStaticQueryListQueryType.nodes.map(({ title }) => (
        <h2>{title}</h2>
      ))}
    </div>
  )
}
