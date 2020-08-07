const render = require(`./renderer`)

module.exports = async (context, cb) => {
  try {
    // TODO emit updates on every change so user see's progress.
    const result = await render(context.recipe, cb, context.inputs, true)
    return result
  } catch (e) {
    console.log(e)
    throw e
  }
}
