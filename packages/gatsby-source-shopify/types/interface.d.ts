interface ShopifyPluginOptions {
  password: string
  storeUrl: string
  downloadImages?: boolean
  shopifyConnections?: string[]
  typePrefix?: string
  salesChannel?: string
}

interface NodeBuilder {
  buildNode: (obj: Record<string, any>) => Promise<NodeInput>
}

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

interface BulkOperationNode {
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

interface CurrentBulkOperationResponse {
  currentBulkOperation: {
    id: string
    status: BulkOperationStatus
  }
}

interface UserError {
  field?: string[]
  message: string
}

interface BulkOperationRunQueryResponse {
  bulkOperationRunQuery: {
    userErrors: UserError[]
    bulkOperation: BulkOperationNode
  }
}

interface BulkOperationCancelResponse {
  bulkOperationCancel: {
    bulkOperation: BulkOperationNode
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
