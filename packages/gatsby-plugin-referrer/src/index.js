const getOriginalReferrer = function() {
  // regex from https://developer.mozilla.org/en-US/docs/Web/API/Document/cookie
  return (
    document.cookie.replace(
      /(?:(?:^|.*;\s*)gatsbyOriginalReferrer\s*=\s*([^;]*).*$)|^.*$/,
      `$1`
    ) || null
  )
}

module.exports = {
  getOriginalReferrer,
}
