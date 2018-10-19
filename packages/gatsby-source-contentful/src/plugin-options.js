const defaultOptions = {
  host: `cdn.contentful.com`,

  // default is always master
  environment: `master`,
}

const validateOptions = options => {
  const errors = []
  ;[`spaceId`, `accessToken`].forEach(option => {
    if (!options[option]) {
      errors.push(`Missing ${option}`)
    }
  })

  return errors
}

const formatOptionsSummary = options => {
  const fields = [`space`, `accessToken`, `host`, `environment`]

  return fields
    .map(
      option =>
        `${option.padEnd(11)} : ${options[option].padEnd(66)}${
          options[option] === defaultOptions[option] ? ` [default value]` : ``
        }`
    )
    .join(`\n`)
}

export { defaultOptions, validateOptions, formatOptionsSummary }
