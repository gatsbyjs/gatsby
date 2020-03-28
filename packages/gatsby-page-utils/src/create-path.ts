import { parse, posix } from "path"

export function createPath(filePath: string): string {
  const { dir, name } = parse(filePath)
  const parsedName = name === `index` ? `` : name

  return posix.join(`/`, dir, parsedName, `/`)
}
