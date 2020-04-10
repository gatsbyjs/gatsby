const runSteps = async (steps, helpers, pluginOptions) => {
  for (const step of steps) {
    await step(helpers, pluginOptions)
  }
}

const runApiSteps = steps => async (helpers, pluginOptions) =>
  runSteps(steps, helpers, pluginOptions)

const runApisInSteps = nodeApis =>
  Object.entries(nodeApis).reduce(
    (gatsbyNodeExportObject, [apiName, apiSteps]) => ({
      ...gatsbyNodeExportObject,
      [apiName]: runApiSteps(apiSteps),
    }),
    {}
  )

export { runSteps, runApisInSteps }
