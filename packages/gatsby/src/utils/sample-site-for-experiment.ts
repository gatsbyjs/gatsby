import { getRepositoryId } from "gatsby-telemetry/lib/repository-id"
import { murmurhash } from "babel-plugin-remove-graphql-queries"

const sampleSite = (experimentName: string, percentage: number): boolean => {
  const bucketNumber =
    murmurhash(
      experimentName + `` + JSON.stringify(getRepositoryId().repositoryId)
    ) % 100

  return bucketNumber < percentage
}

export default sampleSite
