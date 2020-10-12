import React from "react"
import { graphql, getModule } from "gatsby"

function ModuleInPageQuery({ data }) {
  const ModuleFromQuery = getModule(data.moduleMock.mod)

  return (
    <>
      <ModuleFromQuery />
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </>
  )
}

export default ModuleInPageQuery

export const pageQuery = graphql`
  {
    moduleMock(selector: { eq: "page-query" }) {
      mod
    }
  }
`
