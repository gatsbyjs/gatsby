const render = require(`./renderer`)

module.exports = async (context, cb) =>
  new Promise(resolve => {
    render(context.recipe, cb, context.inputs).on(`done`, result =>
      resolve(result)
    )
  })
