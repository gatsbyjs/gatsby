import React from "react"
import { graphql, useStaticQuery } from "gatsby"

export default function FSAPIWithSpaceComponent(props) {
  const data = useStaticQuery(graphql`
    {
      site {
        siteMetadata {
          title
        }
      }
    }
  `)
  return (
    <>
      <pre>
        <code data-cy="static-query-result">
          {data?.site?.siteMetadata?.title}
        </code>
      </pre>
      <hr />
      {props.children}
    </>
  )
}
