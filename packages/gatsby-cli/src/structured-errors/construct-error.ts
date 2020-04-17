import stackTrace from "stack-trace"
import { errorSchema } from "./error-schema"
import { errorMap, defaultError, IErrorMapEntry } from "./error-map"
import { sanitizeStructuredStackTrace } from "../reporter/errors"
import { IConstructError, IStructuredError } from "./types"
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
  const { error } = errorSchema.validate(structuredError)
  if (error !== null) {
    console.log(`Failed to validate error`, error)
    process.exit(1)
  }

  return structuredError
}

export default constructError
