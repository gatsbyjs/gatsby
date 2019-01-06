const isValid = require(`date-fns/isValid`)

const isDate = string => isValid(string)

module.exports = isDate
