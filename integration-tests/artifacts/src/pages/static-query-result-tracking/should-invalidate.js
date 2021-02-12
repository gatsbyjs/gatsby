import React from "react"
import { graphql, useStaticQuery } from "gatsby"

export default function DepStaticQueryPageShouldInvalidate() {
  const data = useStaticQuery(graphql`
    {
      depStaticQuery(id: { eq: "static-query-changing-data-but-not-id" }) {
        label
      }
    }
  `)

  return <pre>{JSON.stringify(data, null, 2)}</pre>
}
