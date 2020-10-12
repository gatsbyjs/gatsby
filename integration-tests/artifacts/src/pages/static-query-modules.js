import React from "react"
import { useStaticQuery, graphql, getModule } from "gatsby"

export default function StaticQueryModules() {
  const { queryModule } = useStaticQuery(graphql`
    {
      queryModule(moduleFileName: "module-b.js")
    }
  `)

  const Component = getModule(queryModule)
  return <Component />
}
