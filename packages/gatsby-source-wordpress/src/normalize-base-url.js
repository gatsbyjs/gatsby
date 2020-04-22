function normalizeBaseUrl(baseUrl) {
  let normalized = baseUrl

  // remove trailing slashes
  normalized = normalized.replace(/\/+$/, ``)

  // remove protocol
  normalized = normalized.replace(/^https?:\/\//, ``)

  return normalized
}

module.exports = normalizeBaseUrl
