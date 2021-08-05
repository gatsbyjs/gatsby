import React from "react"
import { graphql, useStaticQuery } from "gatsby"

export default function DepStaticQueryPageRerunQueryButDontRecreateHtml() {
  const data = useStaticQuery(graphql`
    {
      depStaticQuery(
        id: { eq: "static-query-changing-but-not-invalidating-html" }
      ) {
        label
      }
    }
  `)

  return <pre>{JSON.stringify(data, null, 2)}</pre>
}
