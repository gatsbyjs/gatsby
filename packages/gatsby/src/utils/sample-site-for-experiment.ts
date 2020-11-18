import { getRepositoryId } from "gatsby-telemetry/lib/repository-id"
import { murmurhash } from "babel-plugin-remove-graphql-queries"

const sampleSite = (experimentName: string, percentage: number): boolean =>
  murmurhash(
    experimentName + `` + JSON.stringify(getRepositoryId().repositoryId)
  ) %
    100 <
  percentage

export default sampleSite
