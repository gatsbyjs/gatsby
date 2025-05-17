// Recognize absolute URLs like https://, http://, mailto:, etc.
const ABSOLUTE_URL_REGEX = /^[a-zA-Z][a-zA-Z\d+\-.]*:\/\//;

/**
 * Check if a path is an absolute URL (external).
 */
function isAbsolute(path) {
  return ABSOLUTE_URL_REGEX.test(path);
}

/**
 * Check if a path is a local (internal) link.
 * Returns true if the path is relative to the site, false otherwise.
 */
export function isLocalLink(path) {
  if (typeof path !== 'string') {
    throw new TypeError(`Expected a string, got ${typeof path}`);
  }

  return !isAbsolute(path);
}
