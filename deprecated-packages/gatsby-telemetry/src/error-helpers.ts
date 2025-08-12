import { sep } from "path"

export interface IErrorWithStdErrAndStdOut {
  stderr?: Buffer | string
  stdout?: Buffer | string
  [key: string]: unknown
}

// Removes all user paths
function regexpEscape(str: string): string {
  return str.replace(/[-[/{}()*+?.\\^$|]/g, `\\$&`)
}

export function cleanPaths(str: string, separator: string = sep): string {
  if (!str) return str

  const stack = process.cwd().split(separator)

  while (stack.length > 1) {
    const currentPath = stack.join(separator)
    const currentRegex = new RegExp(regexpEscape(currentPath), `g`)
    str = str.replace(currentRegex, `$SNIP`)

    const currentPath2 = stack.join(separator + separator)
    const currentRegex2 = new RegExp(regexpEscape(currentPath2), `g`)
    str = str.replace(currentRegex2, `$SNIP`)

    stack.pop()
  }
  return str
}

// Takes an Error and returns a sanitized JSON String
export function sanitizeError(
  error: IErrorWithStdErrAndStdOut,
  pathSeparator: string = sep
): string {
  // Convert Buffers to Strings
  if (error.stderr) error.stderr = String(error.stderr)
  if (error.stdout)
    error.stdout = String(error.stdout)

    // Remove sensitive and useless keys
  ;[`envPairs`, `options`, `output`].forEach(key => delete error[key])

  // Hack because Node
  error = JSON.parse(JSON.stringify(error, Object.getOwnPropertyNames(error)))

  const errorString = JSON.stringify(error)

  // Removes all user paths
  return cleanPaths(errorString, pathSeparator)
}
