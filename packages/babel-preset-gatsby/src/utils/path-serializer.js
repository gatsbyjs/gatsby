const slash = require(`slash`)

const cleanNodeModules = dir => {
  const x = dir.split(`node_modules/`)

  if (x.length <= 1) {
    return dir
  }

  return slash(`<PROJECT_ROOT>/node_modules/${x[1]}`)
}

export const test = val =>
  typeof val === `string` && val !== cleanNodeModules(val)

export const print = (val, serialize) => serialize(cleanNodeModules(val))
