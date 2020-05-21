const ALLOWED_STEP_O_COMMANDS = [`Config`]

module.exports = steps => {
  const commandKeys = Object.keys(steps[0]).filter(
    cmd => !ALLOWED_STEP_O_COMMANDS.includes(cmd)
  )

  if (commandKeys.length) {
    return commandKeys.map(key => {
      return {
        step: 0,
        resource: key,
        validationError: `Resources e.g. ${key} should not be placed in the introduction step`,
      }
    })
  } else {
    return []
  }
}
