import React from "react"
import algoliasearch from "algoliasearch"
import algoliaConfig from "./algolia-config"

const client = algoliasearch(
  algoliaConfig.APPLICATION_ID,
  algoliaConfig.API_KEY
)
const searchIndex = client.initIndex(`npm-search`)

interface IUseNpmPackageDataResult {
  data: Record<string, any> | null
  error: Error | null
  fetching: boolean
}

export default function useNpmPackageData(
  name: string
): IUseNpmPackageDataResult {
  const [fetching, setFetching] = React.useState(true)
  const [error, setError] = React.useState<Error | null>(null)
  const [data, setData] = React.useState<Record<string, unknown> | null>(null)

  React.useEffect(() => {
    setFetching(true)
    setError(null)
    setData(null)
    searchIndex
      .getObject(name)
      .then(object => {
        // TODO(@mxstbr): properly type this method and result
        // @ts-ignore
        if (object.readme) {
          setFetching(false)
          setError(null)
          setData(object)
        } else {
          // Fallback for missing readme
          fetch(`https://unpkg.com/${name}/README.md`)
            .then(res => res.text())
            .then(readme => {
              setFetching(false)
              setError(null)
              setData({
                ...object,
                readme,
              })
            })
            .catch(() => null)
        }
      })
      .catch(err => {
        setFetching(false)
        setError(err)
        setData(null)
      })
  }, [name])

  return { fetching, error, data }
}
