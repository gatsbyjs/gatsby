import Joi from "@hapi/joi"
import stackTrace from "stack-trace"
import errorSchema from "./error-schema"
import { errorMap, defaultError, IErrorMapEntry, ErrorId } from "./error-map"
import { sanitizeStructuredStackTrace } from "../reporter/errors"

interface IConstructError {
  details: {
    id?: ErrorId
    context?: Record<string, string>
    error?: string
    [key: string]: unknown
  }
}

interface ILocationPosition {
  line: number
  column: number
}

interface IStructuredError {
  code?: string
  text: string
  stack: {
    fileName: string
    functionName?: string
    lineNumber?: number
    columnNumber?: number
  }[]
  filePath?: string
  location?: {
    start: ILocationPosition
    end?: ILocationPosition
  }
  error?: unknown
  group?: string
  level: IErrorMapEntry["level"]
  type?: IErrorMapEntry["type"]
  docsUrl?: string
}

// Merge partial error details with information from the errorMap
// Validate the constructed object against an error schema
const constructError = ({
  details: { id, ...otherDetails },
}: IConstructError): IStructuredError => {
  const result: IErrorMapEntry = (id && errorMap[id]) || defaultError

  // merge
  const structuredError: IStructuredError = {
    context: {},
    ...otherDetails,
    ...result,
    text: result.text(otherDetails.context),
    stack: otherDetails.error
      ? sanitizeStructuredStackTrace(stackTrace.parse(otherDetails.error))
      : null,
    docsUrl: result.docsUrl || `https://gatsby.dev/issue-how-to`,
  }

  if (id) {
    structuredError.code = id
  }

  // validate
  const { error } = Joi.validate(structuredError, errorSchema)
  if (error !== null) {
    console.log(`Failed to validate error`, error)
    process.exit(1)
  }

  return structuredError
}

export default constructError
