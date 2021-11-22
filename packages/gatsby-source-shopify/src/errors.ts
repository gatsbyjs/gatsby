import { Response } from "node-fetch"

export const pluginErrorCodes = {
  bulkOperationFailed: `111000`,
  unknownSourcingFailure: `111001`,
  unknownApiError: `111002`,

  apiConflict: `111003`,
}

export class OperationError extends Error {
  public node: IBulkOperationNode

  constructor(node: IBulkOperationNode) {
    const { errorCode, id } = node
    super(`Operation ${id} failed with ${errorCode}`)

    this.node = node

    Error.captureStackTrace(this, OperationError)
  }
}

export class HttpError extends Error {
  public response: Response

  constructor(response: Response) {
    super(response.statusText)

    this.response = response

    Error.captureStackTrace(this, HttpError)
  }
}
