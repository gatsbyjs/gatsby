export const CODES = {
  /* Fetch errors */

  LocalesMissing: 111001,
  SelfSignedCertificate: 111002,
  SyncError: 111003,
  FetchContentTypes: 111004,
}

export const ERROR_MAP = {
  [CODES.LocalesMissing]: {
    text: context => context.message,
    level: `ERROR`,
    category: `USER`,
  },
  [CODES.SelfSignedCertificate]: {
    text: context => context.message,
    level: `ERROR`,
    category: `USER`,
  },
  [CODES.SyncError]: {
    text: context => context.message,
    level: `ERROR`,
    category: `THIRD_PARTY`,
  },
  [CODES.FetchContentTypes]: {
    text: context => context.message,
    level: `ERROR`,
    category: `THIRD_PARTY`,
  },
}
/**
 * An alternative approach to https://github.com/gatsbyjs/gatsby-source-wordpress-experimental/blob/c19d845727d6c07c5d84689376c2b6dd66df258b/src/utils/wp-reporter.js#L55-L82
 *
 * Cons: more complex, harder to follow
 * Pros: does the job better
 *
 * *********************
 * Better in what way?
 * *********************
 *
 * The functional wrapper in wordpress-experimental requires us
 * to manually cover every possible member of the reporter object,
 * even though we only need special handling for two functions:
 * `error` and `panic`.
 *
 * In contrast, the proxy allows us to cover only those two
 * functions. Any other members that a caller tries to access will
 * go straight through to the reporter without manually wiring them
 * up.
 *
 * I invite the plugin authors to suggest which approach is more
 * appropriate for this codebase.
 */

export function makeContentfulReporter(reporter) {
  if (!reporter.setErrorMap) {
    return reporter
  }

  return new Proxy(reporter, {
    get(obj, prop) {
      if (
        typeof obj[prop] === `function` &&
        [`error`, `panic`].includes(prop.toString())
      ) {
        return new Proxy(obj[prop], {
          apply: function (target, thisArg, argList) {
            const [message, options = {}] = argList
            const { code, err } = options
            return target.apply(thisArg, [
              {
                id: code,
                context: {
                  message,
                },
              },
              err,
            ])
          },
        })
      }

      return obj[prop]
    },
  })
}
