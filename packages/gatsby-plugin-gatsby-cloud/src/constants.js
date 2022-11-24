import _ from "lodash"

// Gatsby values
export const BUILD_HTML_STAGE = `build-html`
export const BUILD_CSS_STAGE = `build-css`

// Plugin values
export const HEADERS_FILENAME = `_headers.json`
export const REDIRECTS_FILENAME = `_redirects.json`
export const PUBLIC_FUNCTIONS_FILENAME = `_functions.json`
export const SITE_CONFIG_FILENAME = `_gatsby-config.json`
export const CACHE_FUNCTIONS_FILENAME = `manifest.json`

export const DEFAULT_OPTIONS = {
  headers: {},
  mergeSecurityHeaders: true,
  mergeLinkHeaders: true,
  mergeCachingHeaders: true,
  transformHeaders: _.identity, // optional transform for manipulating headers for sorting, etc
  generateMatchPathRewrites: true, // generate rewrites for client only paths
}

export const SECURITY_HEADERS = {
  "/*": [
    `X-XSS-Protection: 1; mode=block`,
    `X-Content-Type-Options: nosniff`,
    `Referrer-Policy: same-origin`,
    `X-Frame-Options: DENY`,
  ],
}

export const IMMUTABLE_CACHING_HEADER = `Cache-Control: public, max-age=31536000, immutable`
export const NEVER_CACHE_HEADER = `Cache-Control: public, max-age=0, must-revalidate`

export const CACHING_HEADERS = {
  "/static/*": [IMMUTABLE_CACHING_HEADER],
  "/sw.js": [NEVER_CACHE_HEADER],
}

export const LINK_REGEX = /^(Link: <\/)(.+)(>;.+)/
