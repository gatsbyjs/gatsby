import { slash } from "gatsby-core-utils"

interface ISerializer {
  test(val: unknown): boolean
  print(val: string, serialize: (val: string) => string): string
}

const cleanNodeModules = (dir: string): string => {
  const x = dir.split(`node_modules/`)

  if (x.length <= 1) {
    return dir
  }

  return slash(`<PROJECT_ROOT>/node_modules/${x[1]}`)
}

export function createSeralizer(): ISerializer {
  return {
    test(val: unknown): boolean {
      return typeof val === `string` && val !== cleanNodeModules(val)
    },
    print(val: string, serialize: (val: string) => string): string {
      return serialize(cleanNodeModules(val))
    },
  }
}
