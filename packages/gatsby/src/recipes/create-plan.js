const resources = require(`./resources`)
const SITE_ROOT = process.cwd()
const ctx = { root: SITE_ROOT }

const asyncForEach = async (array, callback) => {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array)
  }
}

module.exports = async context => {
  const planForNextStep = []

  if (context.currentStep >= context.steps.length) {
    return planForNextStep
  }

  const cmds = context.steps[context.currentStep]
  const commandPlans = Object.entries(cmds).map(async ([key, val]) => {
    const resource = resources[key]

    // Does this resource support creating a plan?
    if (!resource || !resource.plan) {
      return
    }

    // Does the resource support batching?
    if (resource && resource.config && resource.config.batch) {
      const cmdPlan = await resource.plan(ctx, val)
      planForNextStep.push({
        resourceName: key,
        resourceDefinitions: val,
        ...cmdPlan,
      })
    } else {
      await asyncForEach(cmds[key], async cmd => {
        try {
          const commandPlan = await resource.plan(ctx, cmd)
          planForNextStep.push({
            resourceName: key,
            resourceDefinitions: val,
            ...commandPlan,
          })
        } catch (e) {
          console.log(e)
        }
      })
    }
  })

  await Promise.all(commandPlans)

  return planForNextStep
}
