const render = require(`./renderer`)

module.exports = (context, cb) =>
  render(context.recipe, cb, context.inputs, true, true, true)
