const path = require(`path`)
const slash = require(`slash`)
const localPackageRoot = path.resolve(__dirname, `../..`)
const monoRepoRoot = path.resolve(localPackageRoot, `../..`)

const cleanNodeModules = dir =>
  slash(
    dir
      .replace(localPackageRoot, `<PROJECT_ROOT>`)
      .replace(monoRepoRoot, `<PROJECT_ROOT>`)
  )

export const test = val =>
  typeof val === `string` && val !== cleanNodeModules(val)

export const print = (val, serialize) => serialize(cleanNodeModules(val))
