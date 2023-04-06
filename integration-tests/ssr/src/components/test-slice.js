import React from "react"
import { graphql } from "gatsby"

const TestSlice = ({ data }) => {
  return (
    <>
      <div>test</div>
      <pre>{JSON.stringify(data)}</pre>
    </>
  )
}

export default TestSlice

export const sliceQuery = graphql`
  {
    site {
      siteMetadata {
        title
      }
    }
  }
`
