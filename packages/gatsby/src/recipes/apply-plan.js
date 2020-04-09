const resources = require(`./resources`)
const SITE_ROOT = process.cwd()
const ctx = { root: SITE_ROOT }

const asyncForEach = async (array, callback) => {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array)
  }
}

const applyPlan = async stepPlan => {
  let appliedResources = []
  await asyncForEach(stepPlan, async resourcePlan => {
    const resource = resources[resourcePlan.resourceName]

    if (resource.config && resource.config.serial) {
      return await asyncForEach(resourcePlan.resourceDefinitions, r =>
        resource.create(ctx, r)
      )
    }

    const changedResources = await Promise.all(
      resourcePlan.resourceDefinitions.map(r => resource.create(ctx, r))
    )

    appliedResources = appliedResources.concat(changedResources)

    return
  })

  return appliedResources
}

module.exports = applyPlan
