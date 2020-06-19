const render = require(`./renderer`)

module.exports = async (context, cb) => {
  console.log(context)
  const stepAsMdx = [
    ...context.steps,
    ...context.exports
  ].join(`\n`)

  try {
    const result = await render(stepAsMdx, cb, context.inputs)
    return result
  } catch (e) {
    throw e
  }
}
