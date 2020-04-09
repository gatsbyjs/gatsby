const resources = require(`./resources`)
const _ = require(`lodash`)

module.exports = plan => {
  const validationErrors = _.compact(
    _.flattenDeep(
      plan.map((step, i) =>
        Object.keys(step).map(key =>
          step[key].map(resourceDeclaration => {
            const result = resources[key].validate(resourceDeclaration)
            if (result.error) {
              return {
                step: i,
                resource: key,
                resourceDeclaration,
                validationError: result.error,
              }
            }
          })
        )
      )
    )
  )

  return validationErrors
}
