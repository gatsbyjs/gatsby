const Joi = require(`joi`)
const stackTrace = require(`stack-trace`)
const errorSchema = require(`./error-schema`)
const { errorMap, defaultError } = require(`./error-map`)

// Merge partial error details with information from the errorMap
// Validate the constructed object against an error schema
// TODO: 'details' is not a descriptive name
const constructError = ({ details }) => {
  const result = (details.id && errorMap[details.id]) || defaultError

  // merge
  const structuredError = {
    ...details,
    ...result,
    text: result.text(details.context),
    stack: details.error ? stackTrace.parse(details.error) : [],
    docsUrl: result.docsUrl
      ? result.docsUrl
      : `https://gatsby.dev/issue-how-to`,
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
