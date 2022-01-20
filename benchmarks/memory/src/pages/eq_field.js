import React from "react"
import { graphql } from "gatsby"

export default function Home({ data }) {
  return (
    <div>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  )
}

export const q = graphql`
  {
    test(idClone: { eq: "memory-2" }) {
      id
      fooBar
    }
  }
`
