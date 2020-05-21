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
  // We apply each resource serially for now — we can parallalize in the
  // future for SPEED
  await asyncForEach(stepPlan, async resourcePlan => {
    const resource = resources[resourcePlan.resourceName]

    const changedResources = await resource.create(
      ctx,
      resourcePlan.resourceDefinitions
    )

    appliedResources = appliedResources.concat(changedResources)

    return
  })

  return appliedResources
}

module.exports = applyPlan
