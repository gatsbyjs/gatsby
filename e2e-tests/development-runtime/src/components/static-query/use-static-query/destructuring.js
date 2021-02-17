import React from "react"
import { useStaticQuery, graphql } from "gatsby"

function DestructuringQuery(props) {
  let { allSitePlugin } = useStaticQuery(variableQuery)

  if (!allSitePlugin) return `Error`

  const plugins = allSitePlugin.edges
    .map(({ node }) => node)
    .filter(node => !node.pluginFilepath.includes(`gatsby/dist`))
  return (
    <ul {...props}>
      {plugins.map(plugin => (
        <li key={plugin.id}>
          {plugin.name}: {plugin.version}
        </li>
      ))}
    </ul>
  )
}

const variableQuery = graphql`
  {
    allSitePlugin {
      edges {
        node {
          id
          name
          version
          pluginFilepath
        }
      }
    }
  }
`

export default DestructuringQuery
