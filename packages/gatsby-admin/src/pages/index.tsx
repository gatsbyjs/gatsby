import React from "react"
import { useQuery } from "urql"

export default () => {
  const [{ data, fetching, error }] = useQuery({
    query: `
      {
        allGatsbyPlugin {
          nodes {
            name
            id
            shadowedFiles
            shadowableFiles
          }
        }
        npmPackageJson(id: "name") {
          name
          value
        }
      }
    `,
  })

  if (fetching) return <p>Loading...</p>

  if (error) return <p>Oops something went wrong.</p>

  return (
    <>
      <h1>{data.npmPackageJson.value.replace(/^"|"$/g, "")}</h1>
      <h2>Plugins</h2>
      <ul>
        {data.allGatsbyPlugin.nodes
          .filter(plugin => plugin.name.indexOf("gatsby-plugin") === 0)
          .map(plugin => (
            <li key={plugin.id}>{plugin.name}</li>
          ))}
      </ul>
      <h2>Themes</h2>
      <ul>
        {data.allGatsbyPlugin.nodes
          .filter(plugin => plugin.name.indexOf("gatsby-theme") === 0)
          .map(plugin => (
            <li key={plugin.id}>
              <details>
                <summary>{plugin.name}</summary>
                <ul>
                  {plugin.shadowedFiles.map(file => (
                    <li key={file} style={{ opacity: 0.6 }}>
                      {file} (shadowed)
                    </li>
                  ))}
                  {plugin.shadowableFiles.map(file => (
                    <li key={file}>{file}</li>
                  ))}
                </ul>
              </details>
            </li>
          ))}
      </ul>
    </>
  )
}
