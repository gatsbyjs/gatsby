const Joi = require(`@hapi/joi`)
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
    docsUrl: result.docsUrl || `https://gatsby.dev/issue-how-to`,
  }

  if (`id` in structuredError) {
    // TO-DO: decide on the name - errorCode makes sense right now
    // as it's used only for errors, but maybe this should be more general
    // and applicable to any message type.
    // After that go through the code and rename `id` to decided name
    // in call sites.
    structuredError.errorCode = structuredError.id
    delete structuredError.id
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
