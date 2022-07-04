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
 * Throw error if head export is not a valid
 */
export function headExportValidator(head) {
  if (typeof head !== `function`)
    throw new Error(
      `Expected "head" export to be a function got "${typeof head}".`
    )
}

/**
 * Warn for invalid tags in head.
 * @param {string} tagName
 */
export function warnForInvalidTags(tagName) {
  if (process.env.NODE_ENV === `production`) {
    const warning =
      tagName !== `script`
        ? `<${tagName}> is not a valid head element. Please use one of the following: ${VALID_NODE_NAMES.join(
            `, `
          )}`
        : `Do not add scripts here. Please use the <Script> component in your page template instead. For more info see: https://www.gatsbyjs.com/docs/reference/built-in-components/gatsby-script/`

    console.warn(warning)
  }
}
