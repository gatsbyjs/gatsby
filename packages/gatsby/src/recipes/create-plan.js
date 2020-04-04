const resources = require(`./resources`)
const SITE_ROOT = process.cwd()
const ctx = { root: SITE_ROOT }

const asyncForEach = async (array, callback) => {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array)
  }
}

module.exports = async context => {
  console.log(`createPlan`, context)
  const planForNextStep = []

  // If we're at the end
  console.log(`createPlan`, {
    currentStep: context.currentStep,
    length: context.steps.length,
  })
  if (context.currentStep + 1 >= context.steps.length) {
    console.log(`we're at end`)
    return planForNextStep
  }

  const cmds = context.steps[context.currentStep + 1]
  const commandPlans = Object.entries(cmds).map(async ([key, val]) => {
    const resource = resources[key]

    // Does this resource support creating a plan?
    if (!resource || !resource.plan) {
      return
    }

    // Does the resource support batching?
    if (resource && resource.config && resource.config.batch) {
      const cmdPlan = await resource.plan(ctx, val)
      planForNextStep.push({ resourceName: key, resource: val, ...cmdPlan })
    } else {
      await asyncForEach(cmds[key], async cmd => {
        try {
          const commandPlan = await resource.plan(ctx, cmd)
          planForNextStep.push({
            resourceName: key,
            resource: val,
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
