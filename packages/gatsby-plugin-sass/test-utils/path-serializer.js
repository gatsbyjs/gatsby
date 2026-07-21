const cleanNodeModules = value => {
  const normalizedValue = value.replace(/\\/g, `/`)
  const match = normalizedValue.match(
    /node_modules\/(?:\.pnpm\/[^/]+\/node_modules\/)?(.+)/
  )

  if (!match) {
    return value
  }

  // pnpm nests real package paths under `.pnpm/<store-entry>/node_modules/`,
  // but these snapshots only care about the package-relative loader path.
  return `<PROJECT_ROOT>/node_modules/${match[1]}`
}

exports.test = value =>
  typeof value === `string` && value !== cleanNodeModules(value)

exports.print = (value, serialize) => serialize(cleanNodeModules(value))
