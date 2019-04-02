// Removes all user paths
const cleanPaths = str => {
  // TODO: Recursively remove path sections
  const localPathRegex = new RegExp(
    process.cwd().replace(/[-[/{}()*+?.\\^$|]/g, `\\$&`),
    `g`
  )
  return str.replace(localPathRegex, `$PWD`)
}

const ensureArray = value => [].concat(value)

// Takes an Error and returns a sanitized JSON String
const sanitizeError = error => {
  // Convert Buffers to Strings
  if (error.stderr) error.stderr = String(error.stderr)
  if (error.stdout)
    error.stdout = String(error.stdout)

    // Remove sensitive and useless keys
  ;[`envPairs`, `options`, `output`].forEach(key => delete error[key])

  // Hack because Node
  error = JSON.parse(JSON.stringify(error, Object.getOwnPropertyNames(error)))

  const errorString = JSON.stringify(error)

  // Removes all user paths
  return cleanPaths(errorString)
}

// error could be Error or [Error]
const sanitizeErrors = error => {
  const errors = ensureArray(error)
  return errors.map(sanitizeError)
}

module.exports = {
  sanitizeError,
  sanitizeErrors,
  cleanPaths,
}
