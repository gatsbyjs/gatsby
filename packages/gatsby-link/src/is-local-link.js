export function isLocalLink(path) {
  // Handle null/undefined case
  if (!path) return false

  // Check for protocol-containing URLs
  // This will match things like https://, http://, mailto:, tel:, etc.
  if (/^(?:[a-z+]+:)?\/\//i.test(path)) {
    return false
  }

  // If it's not a protocol-based URL, it's likely a local link
  return true
}
