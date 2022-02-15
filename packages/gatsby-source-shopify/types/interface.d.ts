interface IBulkObject {
  id: string
  [key: string]: any
}

type BulkObjects = IBulkObject[]

type BulkResult = Record<string, any>
type BulkResults = BulkResult[]

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

interface ICachedShopifyNode extends IShopifyNode, NodeInput {
  internal: {
    type: string
    mediaType?: string
    content?: string
    contentDigest: string
    description?: string
  }
}

interface ICachedShopifyNodeMap {
  [key: string]: ICachedShopifyNode
}

interface ICurrentBulkOperationResponse {
  currentBulkOperation: {
    id: string
    status: BulkOperationStatus
  }
}

interface IUserError {
  field?: string[]
  message: string
}

interface IBulkOperationRunQueryResponse {
  bulkOperationRunQuery: {
    userErrors: IUserError[]
    bulkOperation: IBulkOperationNode
  }
}

interface IBulkOperationCancelResponse {
  bulkOperationCancel: {
    bulkOperation: IBulkOperationNode
    userErrors: UserError[]
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
}

interface IErrorMapEntry {
  text: (context: IErrorContext) => string
  // keyof typeof is used for these enums so that the public facing API (e.g. used by setErrorMap) doesn't rely on enum but gives an union
  level: keyof typeof Level
  type?: keyof typeof Type
  category?: keyof typeof ErrorCategory
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
  localFile___NODE: string | undefined
}

interface IShopifyImage {
  width: number
  height: number
  originalSrc: string
}

interface IShopifyNode {
  id: string
  shopifyId: string
  [key: string]: any
}

interface IShopifyPluginOptions {
  password: string
  storeUrl: string
  downloadImages?: boolean
  shopifyConnections?: string[]
  typePrefix?: string
  salesChannel?: string
  prioritize?: boolean
}
