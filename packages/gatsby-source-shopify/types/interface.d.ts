interface IBulkResult {
  id: string
  [key: string]: unknown
}

type BulkResults = Array<IBulkResult>

interface IDecoratedResult {
  shopifyId: string
  __parentId?: string
  [key: string]: unknown
}

type BulkOperationStatus =
  | "CANCELED"
  | "CANCELING"
  | "COMPLETED"
  | "CREATED"
  | "EXPIRED"
  | "FAILED"
  | "RUNNING"

interface IBulkOperationNode {
  status: BulkOperationStatus
  /**
   * FIXME: The docs say objectCount is a number, but it's a string. Let's
   * follow up with Shopify on this and make sure it's working as intended.
   */
  objectCount: string
  url: string
  id: string
  errorCode?: "ACCESS_DENIED" | "INTERNAL_SERVER_ERROR" | "TIMEOUT"
  query: string
}

interface ICurrentBulkOperationResponse {
  currentBulkOperation: {
    id: string
    status: BulkOperationStatus
  }
}

interface IUserError {
  field?: Array<string>
  message: string
}

interface IBulkOperationRunQueryResponse {
  bulkOperationRunQuery: {
    userErrors: Array<IUserError>
    bulkOperation: IBulkOperationNode
  }
}

interface IBulkOperationCancelResponse {
  bulkOperationCancel: {
    bulkOperation: IBulkOperationNode
    userErrors: Array<UserError>
  }
}

interface IErrorContext {
  sourceMessage: string
}

enum Level {
  ERROR = `ERROR`,
  WARNING = `WARNING`,
  INFO = `INFO`,
  DEBUG = `DEBUG`,
}

enum Type {
  GRAPHQL = `GRAPHQL`,
  CONFIG = `CONFIG`,
  WEBPACK = `WEBPACK`,
  PLUGIN = `PLUGIN`,
}

enum ErrorCategory {
  USER = `USER`,
  SYSTEM = `SYSTEM`,
  THIRD_PARTY = `THIRD_PARTY`,
  UNKNOWN = `UNKNOWN`,
}

interface IErrorMapEntry {
  text: (context: IErrorContext) => string
  // keyof typeof is used for these enums so that the public facing API (e.g. used by setErrorMap) doesn't rely on enum but gives an union
  level: `${Level}`
  type: `${Type}`
  category: `${ErrorCategory}`
  docsUrl?: string
}

interface IErrorMap {
  [code: string]: IErrorMapEntry
}

interface IGetShopifyImageArgs
  extends Omit<
    IGetImageDataArgs,
    "urlBuilder" | "baseUrl" | "formats" | "sourceWidth" | "sourceHeight"
  > {
  image: IShopifyImage
}

interface IShopifyBulkOperation {
  execute: () => Promise<IBulkOperationRunQueryResponse>
  name: string
}

interface IImageData {
  id: string
  originalSrc: string
  // eslint-disable-next-line @typescript-eslint/naming-convention
  localFile___NODE: string | undefined
}

interface IShopifyImage extends IShopifyNode {
  width: number
  height: number
  originalSrc: string
}

interface IShopifyNode {
  id: string
  shopifyId?: string
  internal: {
    type: string
    mediaType?: string
    content?: string
    contentDigest: string
    description?: string
  }
  [key: string]: unknown
}

interface IShopifyPluginOptions {
  password: string
  storeUrl: string
  downloadImages: boolean
  shopifyConnections: Array<string>
  typePrefix: string
  salesChannel: string
  prioritize?: boolean
  apiVersion: string
}

interface IGraphQLClient {
  request: <T>(query: string, variables?: Record<string, any>) => Promise<T>
}

interface IRestClient {
  request: (path: string) => Promise<import("node-fetch").Response>
}
