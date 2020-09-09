const render = require(`./renderer`)

module.exports = async (context, cb) => {
  try {
    const result = await render(context.recipe, cb, context)
    return result
  } catch (e) {
    throw e
  }
}
