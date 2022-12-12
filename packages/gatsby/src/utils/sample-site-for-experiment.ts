import { getRepositoryId } from "gatsby-telemetry/lib/repository-id"
import { murmurhash } from "gatsby-core-utils/murmurhash"

const sampleSite = (experimentName: string, percentage: number): boolean => {
  const bucketNumber =
    murmurhash(
      experimentName + `` + JSON.stringify(getRepositoryId().repositoryId),
      0
    ) % 100

  return bucketNumber < percentage
}

export default sampleSite
