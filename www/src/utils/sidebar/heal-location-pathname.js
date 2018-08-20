// remove superfluous second forward slash at the beginning of
// location.pathname appearing during `gatsby build`
// @todo remove once this is resolved "upstream"
const healLocationPathname = pathname => pathname.replace(`//`, `/`)

export default healLocationPathname
