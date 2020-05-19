const render = require(`./renderer`)

// TODO: Properly handle context in the renderer
// const SITE_ROOT = process.cwd()
// const ctx = { root: SITE_ROOT }

module.exports = async context => {
  const stepAsMdx = context.steps[context.currentStep]

  try {
    const result = await render(stepAsMdx)
    return result
  } catch (e) {
    throw e
  }
}
