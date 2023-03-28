import glob from "globby"

// Regex created with: https://spec.graphql.org/draft/#sec-Names
// First char only letter, underscore; rest letter, underscore, digit
const extractModelRegex = /\{([a-zA-Z_][\w]*)\./

// Given a absolutePath that has a collection marker it will extract the Model.
// /foo/bar/{Model.bar} => Model
export function extractModel(absolutePath: string): string {
  const model = extractModelRegex.exec(absolutePath)

  // This shouldn't happen - but TS requires us to validate
  // Don't throw an error here as otherwise it would be captured in the onPreInit hook and not by isValidCollectionPathImplementation()
  if (!model) {
    return ``
  }

  return model[1]
}

// Remove the file extension from the end of a path
export function removeFileExtension(absolutePath: string): string {
  return absolutePath.replace(/\.[a-z]+$/, ``)
}

// Remove trailing slash
export function stripTrailingSlash(str: string): string {
  return str.endsWith(`/`) ? str.slice(0, -1) : str
}

const curlyBracesContentsRegex = /\{.*?\}/g

// This extracts all information in an absolute path to an array of each collection part
// /foo/{Model.bar}/{Model.baz} => ['Model.bar', 'Model.baz']
export function extractAllCollectionSegments(
  absolutePath: string
): Array<string> {
  const slugParts = absolutePath.match(curlyBracesContentsRegex)

  // This shouldn't happen - but TS requires us to validate
  if (!slugParts) {
    throw new Error(
      `An error occurred building the slug parts. This is likely a bug within Gatsby and not your code. Please report it to us if you run into this.`
    )
  }

  return slugParts
}

const extractFieldWithoutUnionRegex = /\(.*\)__/g

/**
 * Given a filePath part that is a collection marker it do this transformation:
 * @param {string} filePart - The individual part of the URL
 * @returns {Array<string>} - Returns an array of extracted fields (with converted "Unions")
 * @example
 * {Model.bar} => bar
 * {Model.field__bar} => field__bar
 * {Model.field__(Union)__bar} => field__bar
 */
export function extractFieldWithoutUnion(filePart: string): Array<string> {
  const extracts = extractField(filePart)

  return extracts.map(e => e.replace(extractFieldWithoutUnionRegex, ``))
}

const extractFieldRegexCurlyBraces = /[{}]/g
// Regex created with: https://spec.graphql.org/draft/#sec-Names
// First char only letter, underscore; rest letter, underscore, digit
const extractFieldGraphQLModel = /[a-zA-Z_][\w]*\./

/**
 * Given a filePath part that is a collection marker it do this transformation:
 * @param {string} filePart - The individual part of the URL
 * @returns {Array<string>} - Returns an array of extracted fields
 * @example
 * {Model.field__(Union)__bar} => field__(Union)__bar
 * Also works with lowercased model
 * {model.field} => field
 * Also works with prefixes/postfixes (due to the regex match)
 * prefix-{model.field} => field
 */
export function extractField(filePart: string): Array<string> {
  const content = filePart.match(curlyBracesContentsRegex)

  if (!content) {
    return [``]
  }

  return content.map(c =>
    c
      .replace(extractFieldRegexCurlyBraces, ``)
      .replace(extractFieldGraphQLModel, ``)
  )
}

const switchToPeriodDelimitersRegex = /__/g

// Used to convert filePath field accessors to js syntax accessors.
// e.g.
//   foo__bar => foo.bar
// This can then be used with _.get
export function switchToPeriodDelimiters(filePart: string): string {
  // replace access by periods
  return filePart.replace(switchToPeriodDelimitersRegex, `.`)
}

const convertUnionSyntaxToGraphqlRegex = /\(/g

// Converts the part of the file from something like `(Union)` to `... on Union`
export function convertUnionSyntaxToGraphql(filePart: string): string {
  return filePart
    .replace(convertUnionSyntaxToGraphqlRegex, `... on `)
    .replace(/\)/g, ``)
}

// Compose function to chain multiple methods from this file together
// e.g.
// compose(extractFieldWithoutUnion, switchToPeriodDelimters)(`{Model.foo__bar}`)
export function compose(
  ...functions: Array<(filePart: string) => string>
): (filePart: string) => string {
  return (filePart: string): string =>
    functions.reduce((value, fn) => fn(value), filePart)
}

// Use globby to find all page files with collection routes
// We want to find all files in a given path where any segment includes text wrapped in curly braces
// e.g. "{Collection.field}.tsx" and "{Collection.field}/nestedpage.tsx"
export const pagesGlob = `**/**\\{*\\}**(/**)`
export const findCollectionPageFiles = (
  pagesPath: string
): Promise<Array<string>> => glob(pagesGlob, { cwd: pagesPath })
