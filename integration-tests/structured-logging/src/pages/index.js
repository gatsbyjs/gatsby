import React from "react"
import { graphql } from "gatsby"

const IndexPage = ({ data }) => (
  <div>
    Hello world!
    <br />
    {JSON.stringify(data, null, 2)}
  </div>
)

export default IndexPage

export const pageQuery = graphql`
  {
    allTest {
      nodes {
        field
      }
    }
  }
`
