import React from "react"
import { graphql, getModule } from "gatsby"

export default function PageQueryModules({ data }) {
  const Component = getModule(data.queryModule)
  return <Component />
}

export const pageQuery = graphql`
  {
    queryModule(moduleFileName: "module-a.js")
  }
`
