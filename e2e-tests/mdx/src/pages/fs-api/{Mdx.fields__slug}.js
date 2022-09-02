import React from "react"
import { graphql } from "gatsby"

export default function FSAPIComponent(props) {
  return (
    <>
      <pre>
        <code>{JSON.stringify(props.data.mdx, null, 2)}</code>
      </pre>
      <hr />
      {props.children}
    </>
  )
}

export const query = graphql`
  query SomeQueryName($id: String) {
    mdx(id: { eq: $id }) {
      internal {
        contentFilePath
      }
      fields {
        slug
      }
    }
  }
`
