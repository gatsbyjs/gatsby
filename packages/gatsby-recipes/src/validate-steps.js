const validate = require(`./parser/validate`)

module.exports = steps => {
  const errors = []
  steps.map((stepMdx, i) => {
    const syntaxError = validate(stepMdx)
    if (syntaxError) {
      errors.push(syntaxError)
    }
  })

  return errors
}
