/**
 * Thin wrapper around process.exit(1) for easier unit testing
 */
const exitProcess = () => {
  process.exit(1)
}

// atm those identifiers are used only for unit tests
const CONTENTFUL_CONNECTION_FAILED = Symbol(`CONTENTFUL_CONNECTION_FAILED`)
const CONTENTFUL_DATA_FETCHING_FAILED = Symbol(
  `CONTENTFUL_DATA_FETCHING_FAILED`
)
const OPTIONS_VALIDATION_FAILED = Symbol(`OPTIONS_VALIDATION_FAILED`)

module.exports = {
  exitProcess,
  CONTENTFUL_CONNECTION_FAILED,
  CONTENTFUL_DATA_FETCHING_FAILED,
  OPTIONS_VALIDATION_FAILED,
}
