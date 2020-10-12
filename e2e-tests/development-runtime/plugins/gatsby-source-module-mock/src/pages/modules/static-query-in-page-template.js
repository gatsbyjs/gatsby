import React from "react"
import { graphql, useStaticQuery, getModule } from "gatsby"

export default function ModuleInStaticQueryInPageTemplate() {
  const data = useStaticQuery(graphql`
    {
      moduleMock(selector: { eq: "static-query-in-page-template" }) {
        mod
      }
    }
  `)

  const ModuleFromQuery = getModule(data.moduleMock.mod)

  return (
    <>
      <ModuleFromQuery />
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </>
  )
}
