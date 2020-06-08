const resources = require(`./resources`)
const _ = require(`lodash`)

module.exports = plan => {
  const validationErrors = _.compact(
    _.flattenDeep(
      plan.map((step, i) =>
        Object.keys(step).map(key =>
          step[key].map(resourceDeclaration => {
            if (!resources[key]) {
              return {
                step: i,
                resource: key,
                resourceDeclaration,
                validationError: `Unknown resource ${key}`,
              }
            }

            if (resources[key] && !resources[key].validate) {
              console.log(`${key} is missing an exported validate function`)
              return undefined
            }
            const result = resources[key].validate(
              resourceDeclaration.resourceDefinitions
            )
            if (result.error) {
              return {
                step: i,
                resource: key,
                resourceDeclaration,
                validationError: result.error,
              }
            }
            return undefined
          })
        )
      )
    )
  )

  return validationErrors
}
