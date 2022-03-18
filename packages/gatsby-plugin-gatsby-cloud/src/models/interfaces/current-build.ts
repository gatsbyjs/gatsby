import { BuildStatus } from "../enums"

export default interface ICurrentBuild {
  buildStatus: BuildStatus
  cdnVendor: string | null
  createdAt: Date
  deploymentEndedAt: Date | null
  deploymentStartedAt: Date | null
  duration: number
  endedAt: Date
  id: string
  source: string
  startedAt: Date
}
