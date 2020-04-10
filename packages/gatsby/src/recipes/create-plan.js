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
    // Filter out the Config resource
    if (key === `Config`) {
      return
    }

    // Does this resource support creating a plan?
    if (!resource || !resource.plan) {
      return
    }

    await asyncForEach(cmds[key], async cmd => {
      try {
        const commandPlan = await resource.plan(ctx, cmd)
        planForNextStep.push({
          resourceName: key,
          resourceDefinitions: cmd,
          ...commandPlan,
        })
      } catch (e) {
        console.log(e)
      }
    })
  })

  await Promise.all(commandPlans)

  return planForNextStep
}
