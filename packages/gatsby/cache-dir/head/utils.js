import { VALID_NODE_NAMES } from "./constants"

/**
 * Filter the props coming from a page down to just the ones that are relevant for head.
 * This e.g. filters out properties that are undefined during SSR.
 */
export function filterHeadProps(input) {
  return {
    location: {
      pathname: input.location.pathname,
    },
    params: input.params,
    data: input.data || {},
    pageContext: input.pageContext,
  }
}

/**
 * Throw error if Head export is not a valid
 */
export function headExportValidator(head) {
  if (typeof head !== `function`)
    throw new Error(
      `Expected "Head" export to be a function got "${typeof head}".`
    )
}

/**
 * Warn once for same messsage
 */
let warnOnce = _ => {}
if (process.env.NODE_ENV !== `production`) {
  const warnings = new Set()
  warnOnce = msg => {
    if (!warnings.has(msg)) {
      console.warn(msg)
    }
    warnings.add(msg)
  }
}

/**
 * Warn for invalid tags in head.
 * @param {string} tagName
 */
export function warnForInvalidTags(tagName) {
  if (process.env.NODE_ENV !== `production`) {
    const warning = `<${tagName}> is not a valid head element. Please use one of the following: ${VALID_NODE_NAMES.join(
      `, `
    )}`

    warnOnce(warning)
  }
}
