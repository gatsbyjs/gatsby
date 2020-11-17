import { getRepositoryId } from "gatsby-telemetry/lib/repository-id"
import { murmurhash } from "babel-plugin-remove-graphql-queries"

const sampleSite = ({ experimentName, percentage }) => {
  console.log({ experimentName, repo: getRepositoryId() })
  console.log(murmurhash(experimentName + getRepositoryId()) % 100)
  return (
    murmurhash(experimentName + `` + JSON.stringify(getRepositoryId())) % 100 <
    percentage
  )
}

export default sampleSite
