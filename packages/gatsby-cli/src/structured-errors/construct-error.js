const Joi = require(`@hapi/joi`)
const stackTrace = require(`stack-trace`)
const errorSchema = require(`./error-schema`)
const { errorMap, defaultError } = require(`./error-map`)
const { sanitizeStructuredStackTrace } = require(`../reporter/errors`)

// Merge partial error details with information from the errorMap
// Validate the constructed object against an error schema
// TODO: 'details' is not a descriptive name
const constructError = ({ details: { id, ...otherDetails } }) => {
  const result = (id && errorMap[id]) || defaultError

  // merge
  const structuredError = {
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

module.exports = constructError
