import published from '../../bin/published'

const libDirs = /(node_modules|bower_components)/i
let gatsbyLib = /(gatsby.lib)/i
// If installed globally, look for "dist" directory instead.
if (published) {
  gatsbyLib = /(gatsby.dist)/i
}

export default (absPath) => {
  let result = false
  if (absPath.match(gatsbyLib)) {
    // There is a match, don't exclude this file.
    result = false
  } else if (absPath.match(libDirs)) {
    // There is a match, do exclude this file.
    result = true
  } else {
    result = false
  }

  return result
}
