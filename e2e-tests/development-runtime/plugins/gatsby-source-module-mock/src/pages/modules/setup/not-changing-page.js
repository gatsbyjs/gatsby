import React from "react"
import { graphql } from "gatsby"

export default function NotChangingPage({ data }) {
  return (
    <>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </>
  )
}

export const pageQuery = graphql`
  {
    modPQA: moduleByName(name: "page-query/module-a")
    modPQB: moduleByName(name: "page-query/module-b")
    modSQinPTA: moduleByName(name: "static-query-in-page-template/module-a")
    modSQinPTB: moduleByName(name: "static-query-in-page-template/module-b")
    modSQunderPTA: moduleByName(
      name: "static-query-under-page-template/module-a"
    )
    modSQunderPTB: moduleByName(
      name: "static-query-under-page-template/module-b"
    )
  }
`
