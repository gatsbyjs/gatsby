const render = require(`./renderer`)

module.exports = async (context, cb) => {
  const stepAsMdx = [...context.steps, ...context.exports].join(`\n`)

  try {
    const result = await render(stepAsMdx, cb, context.inputs, true)
    return result
  } catch (e) {
    console.log(e)
    throw e
  }
}
