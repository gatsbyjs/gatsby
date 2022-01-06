import { BuildStatus } from "../enums"

export default interface IBaseButtonProps {
  buttonIndex: number
  orgId: string
  siteId: string
  buildId: string
  createdAt: Date
  buildStatus: BuildStatus
}
