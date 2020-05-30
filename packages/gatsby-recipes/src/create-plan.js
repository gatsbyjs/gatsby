const render = require(`./renderer`)

// TODO: Properly handle context in the renderer
// const SITE_ROOT = process.cwd()
// const ctx = { root: SITE_ROOT }

module.exports = async (context, cb) => {
  const stepAsMdx = context.steps.join(`\n`)

  try {
    const result = await render(stepAsMdx, cb, context.inputs)
    return result
  } catch (e) {
    throw e
  }
}
