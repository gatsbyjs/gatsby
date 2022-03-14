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

enum BuildStatus {
  GitClone = `GIT_CLONE`,
  GitCloneError = `GIT_CLONE_ERROR`,
  GitPull = `GIT_PULL`,
  GitPullError = `GIT_PULL_ERROR`,
  DepInstall = `DEP_INSTALL`,
  DepInstallError = `DEP_INSTALL_ERROR`,
  Queued = `QUEUED`,
  Canceled = `CANCELED`,
  CanceledByGatsbyCloud = `CANCELED_BY_GATSBY_CLOUD`,
  Building = `BUILDING`,
  Uploading = `UPLOADING`,
  Publishing = `PUBLISHING`,
  UploadError = `UPLOAD_ERROR`,
  PublishError = `PUBLISH_ERROR`,
  PublishCanceled = `PUBLISH_CANCELED`,
  TimedOut = `TIMED_OUT`,
  Success = `SUCCESS`,
  Error = `ERROR`,
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
