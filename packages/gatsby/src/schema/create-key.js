// @flow
const regex = new RegExp(`[^a-zA-Z0-9_]`, `g`)

/**
 * GraphQL field names cannot contain anything other than alphanumeric
 * characters and `_`. They also can't start with `__` which is reserved for
 * internal fields (`___foo` doesn't work either).
 */
module.exports = (key: string): string => key.replace(regex, `_`)
