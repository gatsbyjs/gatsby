import { BuildStatus } from "../../models/enums"

export interface IProxyRequestError {
  message?: string
  code: number
  passwordProtected?: true
}

interface INodeManifestPage {
  path?: string
}

type FoundPageBy =
  | `ownerNodeId`
  | `filesystem-route-api`
  | `context.id`
  | `context.slug`
  | `queryTracking`
  | `none`

export interface INodeManifestOut {
  page: INodeManifestPage
  node: {
    id: string
  }
  foundPageBy: FoundPageBy
  pageDataDigest?: string
  id?: string
}

export interface IPageDataJsonParams {
  manifest?: INodeManifestOut
  frontendUrl: string
}

export interface IPageData {
  path: string
  manifestId?: string
}

export interface IContentLoaderInfo {
  previewBuildStatus?: BuildStatus
  previewUrl?: string
  orgId?: string
}

export interface IPollArguments {
  contentLoaderInfo?: IContentLoaderInfo
  shouldPoll: boolean
  showError: boolean
  manifestId: string
  sourcePluginName: string
  siteId: string
  frontendUrl: string | false
  pollCount: number
  pollCallback?: () => void
  waitThenTriggerNextPoll: () => void
  setErrorMessage: (arg: string) => void
  setShowError: (arg: boolean) => void
  setRedirectUrl: (arg: string) => void
  setLoadingDuration: (arg: number) => void
}
