const getOriginalReferrer = () => 
  // regex from https://developer.mozilla.org/en-US/docs/Web/API/Document/cookie
   (
    document.cookie.replace(
      /(?:(?:^|.*;\s*)gatsbyOriginalReferrer\s*=\s*([^;]*).*$)|^.*$/,
      `$1`
    ) || null
  )


export default {
  getOriginalReferrer,
}
