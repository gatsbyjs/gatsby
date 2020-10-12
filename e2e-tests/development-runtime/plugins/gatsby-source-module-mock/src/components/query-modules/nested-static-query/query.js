import React from "react"
import { graphql, getModule, useStaticQuery } from "gatsby"

export default function WithStaticQueryImportedByModule() {
  const data = useStaticQuery(graphql`
    {
      moduleMock {
        mod
      }
    }
  `)

  const SomeComponent = getModule(data.moduleMock.mod)

  return (
    <>
      <SomeComponent />
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </>
  )
}
