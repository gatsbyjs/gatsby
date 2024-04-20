import { store } from "../redux"
import { memoize } from "lodash"

import { createRequireFromPath } from "gatsby-core-utils"
import { join, dirname } from "path"
import type { PackageJson } from "../.."
import { readFile } from "fs-extra"

export type IDependency = {
  name: string
  version: string
  path: string
}

export function getAllDependencies(pkg: PackageJson): Set<[string, string]> {
  return new Set([
    ...Object.entries(pkg.dependencies || {}),
    ...Object.entries(pkg.devDependencies || {}),
    ...Object.entries(pkg.optionalDependencies || {}),
  ])
}

async function readJSON(file: string): Promise<PackageJson> {
  const buffer = await readFile(file)
  return JSON.parse(buffer.toString()) as PackageJson
}

export async function getTreeFromNodeModules(
  dir: string,
  results: Map<string, IDependency> | undefined = new Map(),
): Promise<Array<IDependency>> {
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
        console.error(`Error reading ${name}/package.json`, error)
      }
    }),
  )

  return Array.from(results.values())
}

export const getGatsbyDependents = memoize(
  async (): Promise<Array<IDependency>> => {
    const { program } = store.getState()
    return getTreeFromNodeModules(program.directory)
  },
)
