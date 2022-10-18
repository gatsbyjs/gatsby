/**
 * Extract undefined global variables used in server context from a reference error.
 */
export function extractUndefinedGlobal(error: ReferenceError): string {
  const match = error.message.match(
    /(window|document|localStorage|navigator|alert|location) is not defined/i
  )

  if (match && match[1]) {
    return match[1]
  }

  return ``
}
