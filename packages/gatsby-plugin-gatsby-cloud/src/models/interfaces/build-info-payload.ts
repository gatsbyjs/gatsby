import ICurrentBuild from "./current-build"
import ILatestBuild from "./latest-build"
import ISiteInfo from "./site-info"

export default interface IBuildInfoPayload {
  currentBuild?: ICurrentBuild
  latestBuild?: ILatestBuild
  siteInfo?: ISiteInfo
}
