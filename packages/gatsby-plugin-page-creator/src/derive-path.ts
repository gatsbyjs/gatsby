import _ from "lodash"
import slugify, { Options as ISlugifyOptions } from "@sindresorhus/slugify"
import { Reporter } from "gatsby/reporter"
import {
  extractFieldWithoutUnion,
  extractAllCollectionSegments,
  switchToPeriodDelimiters,
  stripTrailingSlash,
  removeFileExtension,
} from "./path-utils"

const doubleForwardSlashes = /\/\/+/g
// Match 0 or 1 of "/"
const indexRoute = /^\/?$/

// Generates the path for the page from the file path
// product/{Product.id} => /product/:id, pulls from nodes.id
// product/{Product.sku__en} => product/:sku__en pulls from nodes.sku.en
// blog/{MarkdownRemark.parent__(File)__relativePath}} => blog/:slug pulls from nodes.parent.relativePath
export function derivePath(
  path: string,
  node: Record<string, any>,
  reporter: Reporter,
  slugifyOptions?: ISlugifyOptions
): { errors: number; derivedPath: string } {
  // 0. Since this function will be called for every path times count of nodes the errors will be counted and then the calling function will throw the error once
  let errors = 0

  // 1.  Incoming path can optionally be stripped of file extension (but not mandatory)
  let modifiedPath = path

  // 2.  Pull out the slug parts that are within { } brackets.
  const slugParts = extractAllCollectionSegments(path)

  // 3.  For each slug parts get the actual value from the node data
  slugParts.forEach(slugPart => {
    // 3.a.  this transforms foo__bar into foo.bar
    const cleanedField = extractFieldWithoutUnion(slugPart)[0]
    const key = switchToPeriodDelimiters(cleanedField)

    // 3.b  We do node or node.nodes here because we support the special group
    //      graphql field, which then moves nodes in another depth
    const nodeValue = _.get(node.nodes, `[0]${key}`) || _.get(node, key)

    // 3.c  log error if the key does not exist on node
    if (nodeValue === undefined) {
      if (process.env.gatsby_log_level === `verbose`) {
        reporter.verbose(
          `Could not find value in the following node for key ${slugPart} (transformed to ${key}) for node:

        ${JSON.stringify(node, null, 2)}`
        )
      }

      errors++

      return
    }

    // 3.d  Safely slugify all values (to keep URL structures) and remove any trailing slash
    const value = stripTrailingSlash(safeSlugify(nodeValue, slugifyOptions))

    // 3.e  replace the part of the slug with the actual value
    modifiedPath = modifiedPath.replace(slugPart, value)
  })

  // 4.  Remove double forward slashes that could occur in the final URL
  modifiedPath = modifiedPath.replace(doubleForwardSlashes, `/`)

  // 5.  Remove trailing slashes that could occur in the final URL
  modifiedPath = stripTrailingSlash(modifiedPath)

  // 6.  If the final URL appears to be an index path, use the "index" file naming convention
  if (indexRoute.test(removeFileExtension(modifiedPath))) {
    modifiedPath = `index${modifiedPath}`
  }

  const derivedPath = modifiedPath

  return {
    errors,
    derivedPath,
  }
}

// If the node value is meant to be a slug, like `foo/bar`, the slugify
// function will remove the slashes. This is a hack to make sure the slashes
// stick around in the final url structuring
function safeSlugify(
  nodeValue: string,
  slugifyOptions?: ISlugifyOptions
): string {
  // The incoming GraphQL data can also be a number
  const input = String(nodeValue)
  const tempArr = input.split(`/`)

  return tempArr.map(v => slugify(v, slugifyOptions)).join(`/`)
}
