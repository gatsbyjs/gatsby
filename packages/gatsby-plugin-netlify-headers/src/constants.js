import _ from "lodash"

// Gatsby values
export const BUILD_HTML_STAGE = `build-html`
export const BUILD_CSS_STAGE = `build-css`

// Plugin values
export const NETLIFY_HEADERS_FILENAME = `_headers`

export const DEFAULT_OPTIONS = {
  headers: {},                  // object
  mergeSecurityHeaders: true,   // boolean or function (headers, securityHeaders) => newConfig
  mergeLinkHeaders: true,       // boolean or function (headers, linkHeaders) => newConfig
  transformHeaders: _.identity, // optional transform for manipulating headers for sorting, etc
}

export const SECURITY_HEADERS = {
  "/*": [
    `X-Frame-Options: DENY`,
    `X-XSS-Protection: 1; mode=block`,
    `X-Content-Type-Options: nosniff`,
  ],
}

export const LINK_REGEX = /^(Link: <\/)(.+)(>;.+)/
export const ROOT_WILDCARD = `/*`

export const COMMON_BUNDLES = [
  `commons`,
  `app`,
]
