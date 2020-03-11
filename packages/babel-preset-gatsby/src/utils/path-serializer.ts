import { slash } from "gatsby-core-utils"

const cleanNodeModules = (dir: string): string => {
  const x = dir.split(`node_modules/`)

  if (x.length <= 1) {
    return dir
  }

  return slash(`<PROJECT_ROOT>/node_modules/${x[1]}`)
}

export const test = (val: unknown): boolean =>
  typeof val === `string` && val !== cleanNodeModules(val)

export const print = (
  val: string,
  serialize: (val: string) => string
): string => serialize(cleanNodeModules(val))
