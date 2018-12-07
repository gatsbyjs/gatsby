// const replacer = (match, offset) => (offset ? "_" + match.toLowerCase() : match)
const replacer = match => `_` + match.toLowerCase()

// const toSnakeCase = str => str && str.replace(/[A-Z]/g, replacer)
const toSnakeCase = str => str && str.replace(/(?!^)[A-Z]/g, replacer)

module.exports = toSnakeCase
