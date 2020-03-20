import { store } from "../redux"
import { memoize } from "lodash"

import { createRequireFromPath } from "gatsby-core-utils"
import { join, dirname } from "path"
import { PackageJson } from "../.."
import { readFile } from "fs-extra"

interface IDependency {
  name: string
  version: string
  path: string
}

const getAllDependencies = (pkg: PackageJson): Set<[string, string]> =>
  new Set([
    ...Object.entries(pkg.dependencies || {}),
    ...Object.entries(pkg.devDependencies || {}),
    ...Object.entries(pkg.optionalDependencies || {}),
  ])

const readJSON = async (file: string): Promise<PackageJson> => {
  const buffer = await readFile(file)
  return JSON.parse(buffer.toString())
}

const getTreeFromNodeModules = async (
  dir: string,
  results: Map<string, IDependency> = new Map()
): Promise<IDependency[]> => {
  const requireFromHere = createRequireFromPath(`${dir}/:internal:`)
  let packageJSON: PackageJson
  try {
    packageJSON = await readJSON(require.resolve(join(dir, `package.json`)))
  } catch (error) {
    packageJSON = {}
  }

  await Promise.all(
    Array.from(getAllDependencies(packageJSON)).map(async ([name, version]) => {
      try {
        const currentDependency: IDependency = {
          name,
          version,
          path: dirname(requireFromHere.resolve(`${name}/package.json`)),
        }

        // Include anything that has `gatsby` in its name but not `gatsby` itself
        if (
          /gatsby/.test(currentDependency.name) &&
          currentDependency.name !== `gatsby`
        ) {
          await getTreeFromNodeModules(currentDependency.path, results)
          if (!results.has(currentDependency.name))
            results.set(currentDependency.name, currentDependency)
        }
      } catch (error) {
        // Sometimes dev dependencies of dependencies aren't installed
        // when using `yarn`. This is okay and safe to ignore.
      }
    })
  )

  return Array.from(results.values())
}

export const getGatsbyDependents = memoize(
  async (): Promise<IDependency[]> => {
    const { program } = store.getState()
    return getTreeFromNodeModules(program.directory)
  }
)
