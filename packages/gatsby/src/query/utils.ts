import { Path } from "graphql/jsutils/Path"

export const indentString = (string: string): string =>
  string.replace(/\n/g, `\n  `)

export const formatErrorDetails = (errorDetails: Map<string, any>): string =>
  Array.from(errorDetails.entries())
    .map(
      ([name, details]) => `${name}:
  ${indentString(details.toString())}`
    )
    .join(`\n`)

export function pathToArray(path: Path | undefined): Array<string | number> {
  const flattened: Array<string | number> = []
  let curr: Path | undefined = path
  while (curr) {
    flattened.push(curr.key)
    curr = curr.prev
  }
  return flattened.reverse()
}
