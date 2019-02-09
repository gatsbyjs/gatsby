const deepmerge = require(`deepmerge`)

const pathToObject = path => {
  if (path && typeof path === `string`) {
    return path.split(`.`).reduceRight((acc, key) => {
      return { [key]: acc }
    }, true)
  }
  return {}
}

const withSortFields = (fields, sortFields = []) =>
  sortFields.reduce((acc, field) => {
    const sortField = pathToObject(field.replace(/___/g, `.`))
    return deepmerge(acc, sortField)
  }, fields)

module.exports = withSortFields
