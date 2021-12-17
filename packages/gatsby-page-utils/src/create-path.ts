import { parse, posix } from "path"

export function createPath(
  filePath: string,
  withTrailingSlash: boolean = true
): string {
  const { dir, name } = parse(filePath)
  const parsedName = name === `index` ? `` : name
  const postfix = withTrailingSlash ? `/` : ``

  return posix.join(`/`, dir, parsedName, postfix)
}
