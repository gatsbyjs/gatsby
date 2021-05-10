import React from "react"
import { graphql, useStaticQuery } from "gatsby"

export default function DepStaticQueryPageStable() {
  const data = useStaticQuery(graphql`
    {
      depStaticQuery(id: { eq: "static-query-stable" }) {
        label
      }
    }
  `)

  return <pre>{JSON.stringify(data, null, 2)}</pre>
}
