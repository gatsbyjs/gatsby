// @flow
const regex = new RegExp(`[^a-zA-Z0-9_]`, `g`)

/**
 * GraphQL field names cannot contain anything other than alphanumeric
 * characters and `_`. They also can't start with `__` which is reserved for
 * internal fields (`___foo` doesn't work either).
 */
module.exports = (key: string): string => {
    // check if your key is really a string otherwise you have bad data ...
    if (typeof key !== 'string') {
       throw `Graphql field name (key) is not a string -> ${key}`;
    }
    return key.replace(regex, `_`)
}
