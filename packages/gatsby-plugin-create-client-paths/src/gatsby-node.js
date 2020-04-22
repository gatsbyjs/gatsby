// Prefixes should be globs (i.e. of the form "/*" or "/foo/*")
const validatePrefixEntry = prefix => {
  if (!prefix.match(/^\//) || !prefix.match(/\/\*$/)) {
    throw Error(
      `Plugin "gatsby-plugin-client-only-paths" found invalid prefix pattern: ${prefix}`
    )
  }
}

exports.onCreatePage = ({ page, actions }, { prefixes }) => {
  const { createPage } = actions
  const re = {}
  prefixes.forEach(validatePrefixEntry)

  // Don't set matchPath again if it's already been set.
  if (page.matchPath || page.path.match(/dev-404-page/)) {
    return
  }

  prefixes.forEach(prefix => {
    if (!re[prefix]) {
      // Remove the * from the prefix and memoize
      const trimmedPrefix = prefix.replace(/\*$/, ``)
      re[prefix] = new RegExp(`^${trimmedPrefix}`)
    }

    // Ensure that the path ends in a trailing slash, since it can be removed.
    const path = page.path.match(/\/$/) ? page.path : `${page.path}/`

    if (path.match(re[prefix])) {
      page.matchPath = prefix.replace(/\*$/, `*`)
      createPage(page)
    }
  })
}
