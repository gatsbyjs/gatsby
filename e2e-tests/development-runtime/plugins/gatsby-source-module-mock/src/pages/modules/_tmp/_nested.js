import React from "react"
import { graphql, getModule } from "gatsby"

export default function ModuleWithStaticQuery({ data }) {
  const SomeComponent = getModule(data.moduleByName)

  // console.log({ SomeComponent, data })

  return (
    <>
      <SomeComponent />
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </>
  )
}

export const pageQuery = graphql`
  {
    moduleByName(name: "nested-static-query/module")
  }
`
