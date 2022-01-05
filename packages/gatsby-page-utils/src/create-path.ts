import { parse, posix } from "path"

export function createPath(
  filePath: string,
  withTrailingSlash: boolean = true,
  usePathBase: boolean = false
): string {
  const { dir, name, base } = parse(filePath)
  const parsedBase = base === `index` ? `` : base
  const parsedName = name === `index` ? `` : name
  const postfix = withTrailingSlash ? `/` : ``

  return posix.join(`/`, dir, usePathBase ? parsedBase : parsedName, postfix)
}
