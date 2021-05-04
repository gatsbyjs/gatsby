import stackTrace from "stack-trace"
import { errorSchema } from "./error-schema"
import { defaultError, ErrorId, errorMap, IErrorMapEntry } from "./error-map"
import { sanitizeStructuredStackTrace } from "../reporter/errors"
import { IConstructError, IStructuredError } from "./types"
// Merge partial error details with information from the errorMap
// Validate the constructed object against an error schema
const constructError = (
  { details: { id, ...otherDetails } }: IConstructError,
  suppliedErrorMap: Record<ErrorId, IErrorMapEntry>
): IStructuredError => {
  let errorMapEntry = defaultError

  if (id) {
    // Look at original errorMap, ids cannot be overwritten
    if (errorMap[id]) {
      errorMapEntry = errorMap[id]
    } else if (suppliedErrorMap[id]) {
      errorMapEntry = suppliedErrorMap[id]
    }
  }

  // merge
  const structuredError: IStructuredError = {
    context: {},
    ...otherDetails,
    ...errorMapEntry,
    text: errorMapEntry.text(otherDetails.context),
    stack: otherDetails.error
      ? sanitizeStructuredStackTrace(stackTrace.parse(otherDetails.error))
      : [],
    docsUrl: errorMapEntry.docsUrl || `https://gatsby.dev/issue-how-to`,
  }

  if (id) {
    structuredError.code = id
  }

  // validate
  const { error } = errorSchema.validate(structuredError)
  if (error) {
    console.log(`Failed to validate error`, error)
    console.trace()
    process.exit(1)
  }

  return structuredError
}

export default constructError
