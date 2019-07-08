import { store } from "../redux"
import { memoize } from "lodash"

const createRequireFromPath = require(`./create-require-from-path`)
const { join, dirname } = require(`path`)

const fs = require(`fs`)
const { promisify } = require(`util`)
const readFile = promisify(fs.readFile)

const getAllDependencies = (pkg, { noDev } = {}) =>
  new Set([
    ...Object.entries(pkg.dependencies || {}),
    ...Object.entries((!noDev && pkg.devDependencies) || {}),
    ...Object.entries(pkg.optionalDependencies || {}),
  ])

const readJSON = async file => {
  const buffer = await readFile(file)
  return JSON.parse(buffer.toString())
}

const getTreeFromNodeModules = async (
  dir,
  filterFn = () => true,
  results = new Map()
) => {
  const requireFromHere = createRequireFromPath(`${dir}/:internal:`)
  const packageJSON = await readJSON(require.resolve(join(dir, `package.json`)))
  await Promise.all(
    Array.from(getAllDependencies(packageJSON)).map(async ([name, version]) => {
      const currentDependency = {
        name,
        version,
        path: dirname(requireFromHere.resolve(`${name}/package.json`)),
      }
      if (filterFn(currentDependency)) {
        await getTreeFromNodeModules(currentDependency.path, filterFn, results)
        if (!results.has(currentDependency.name))
          results.set(currentDependency.name, currentDependency)
      }
    })
  )
  return Array.from(results.values())
}

// Returns [Object] with name and path
module.exports = memoize(async () => {
  const { program } = store.getState()
  const nodeModules = await getTreeFromNodeModules(
    program.directory,
    // Include anything that has `gatsby` in its name but not `gatsby` itself
    dependency => /gatsby/.test(dependency.name) && dependency.name !== `gatsby`
  )
  return nodeModules
})
