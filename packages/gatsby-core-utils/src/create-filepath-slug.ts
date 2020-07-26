const slugify = require(`slugify`)
const path = require(`path`)

/**
 * Creates a valid slug from a filepath.
 *
 * @param filepath Path to file
 * @return Slug based on filepath
 */
export const createFilepathSlug = (filepath: string): string => {
  const parsedPath = path.parse(filepath)

  let relevantPath
  if (parsedPath.name === `index`) {
    relevantPath = filepath.replace(parsedPath.base, ``)
  } else {
    relevantPath = filepath.replace(parsedPath.ext, ``)
  }

  return slugify(relevantPath, {
    remove: /[^\w\s$*_+~.()'"!\-:@/]/g, // this is the set of allowable characters
  })
}
