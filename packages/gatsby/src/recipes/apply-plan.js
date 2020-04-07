const resources = require(`./resources`)
const SITE_ROOT = process.cwd()
const ctx = { root: SITE_ROOT }

const asyncForEach = async (array, callback) => {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array)
  }
}

const applyPlan = async stepPlan =>
  await asyncForEach(stepPlan, async resourcePlan => {
    const resource = resources[resourcePlan.resourceName]

    if (resource.config?.serial) {
      return await asyncForEach(resourcePlan.resource, r =>
        resource.create(ctx, r)
      )
    }

    if (resource.config?.batch) {
      return await resource.create(ctx, resourcePlan.resource)
    }

    return await Promise.all(
      resourcePlan.resource.map(r => resource.create(ctx, r))
    )
  })

module.exports = applyPlan
