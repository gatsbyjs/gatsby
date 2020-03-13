import Joi from "@hapi/joi"
import stackTrace from "stack-trace"
import errorSchema from "./error-schema"
import { errorMap, defaultError, IErrorMapEntry } from "./error-map"
import { isNodeInternalModulePath } from "gatsby-core-utils"
import { IErrorDetails } from "../reporter"

interface IConstructError {
  details: IErrorDetails
}

interface ILocationPosition {
  line: number
  column: number
}
export interface ICallSite {
  fileName: string
  functionName?: string
  lineNumber?: number
  columnNumber?: number
}

export interface IStructuredError {
  code?: string
  text: string
  stack: ICallSite[] | null
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

const packagesToSkip = [`core-js`, `bluebird`, `regenerator-runtime`, `graphql`]

const packagesToSkipTest = new RegExp(
  `node_modules[\\/](${packagesToSkip.join(`|`)})`
)

const sanitizeStructuredStackTrace = (stack: ICallSite[]): ICallSite[] => {
  // first filter out not useful call sites
  stack = stack.filter(callSite => {
    if (!callSite.fileName) {
      return false
    }

    if (packagesToSkipTest.test(callSite.fileName)) {
      return false
    }

    if (callSite.fileName.includes(`asyncToGenerator.js`)) {
      return false
    }

    if (isNodeInternalModulePath(callSite.fileName)) {
      return false
    }

    return true
  })

  // then sanitize individual call site objects to make sure we don't
  // emit objects with extra fields that won't be handled by consumers
  stack = stack.map(({ fileName, functionName, lineNumber, columnNumber }) => {
    return {
      fileName,
      functionName,
      lineNumber,
      columnNumber,
    }
  })

  return stack
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
