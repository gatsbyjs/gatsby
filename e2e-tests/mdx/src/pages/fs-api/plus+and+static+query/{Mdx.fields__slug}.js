import React from "react"
import { graphql, useStaticQuery } from "gatsby"

export default function FSAPIWithPlusComponent(props) {
  const data = useStaticQuery(graphql`
    {
      site {
        siteMetadata {
          plus: title
        }
      }
    }
  `)
  return (
    <>
      <pre>
        <code data-cy="static-query-result">
          {data?.site?.siteMetadata?.plus}
        </code>
      </pre>
      <hr />
      {props.children}
    </>
  )
}
