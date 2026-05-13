import { slash } from "gatsby-core-utils"

const cleanNodeModules = (dir: string): string => {
  const normalizedDir = slash(dir)
  const match = normalizedDir.match(
    /node_modules\/(?:\.pnpm\/[^/]+\/node_modules\/)?(.+)/
  )

  if (!match) {
    return dir
  }

  // pnpm nests the real package path under `.pnpm/<store-entry>/node_modules/`,
  // but the snapshots only care about the package-relative path in node_modules.
  return `<PROJECT_ROOT>/node_modules/${match[1]}`
}

export const test = (val: unknown): boolean =>
  typeof val === `string` && val !== cleanNodeModules(val)

export const print = (
  val: string,
  serialize: (val: string) => string
): string => serialize(cleanNodeModules(val))
