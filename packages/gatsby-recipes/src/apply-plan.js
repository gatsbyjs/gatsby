const render = require(`./renderer`)

module.exports = (context, cb) =>
  render(context.recipe, cb, context, true, true, true)
