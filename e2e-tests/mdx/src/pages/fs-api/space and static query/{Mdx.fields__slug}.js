import React from "react"
import { graphql, useStaticQuery } from "gatsby"

export default function FSAPIWithSpaceComponent(props) {
  const data = useStaticQuery(graphql`
    {
      site {
        siteMetadata {
          space: title
        }
      }
    }
  `)
  return (
    <>
      <pre>
        <code data-cy="static-query-result">
          {data?.site?.siteMetadata?.space}
        </code>
      </pre>
      <hr />
      {props.children}
    </>
  )
}
