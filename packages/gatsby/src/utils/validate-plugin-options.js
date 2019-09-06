exports.validatePluginOptions = (res, options = {}) => {
  let chain = Promise.resolve(res)
  if (res && res.validate) {
    chain = res.validate(options, {
      abortEarly: false,
      allowUnknown: true,
    })
  }
  return chain
}

exports.formatOptionsError = (err, plugin = {}) => {
  return {
    id: `11329`,
    context: Object.assign({}, plugin, {
      errors: [].concat(
        err.details
          ? err.details.map(detail => detail.message)
          : err.message || err
      ),
    }),
  }
}
