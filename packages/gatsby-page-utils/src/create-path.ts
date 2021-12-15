import { parse, posix } from "path"
import {
  applyTrailingSlashOption,
  TrailingSlash,
} from "./apply-trailing-slash-option"

export function createPath(
  filePath: string,
  option: TrailingSlash = `legacy`
): string {
  const { dir, name } = parse(filePath)
  const parsedName = name === `index` ? `` : name
  const hasHtmlSuffix = parsedName.endsWith(`.html`)

  if (hasHtmlSuffix) {
    option = `never`
  }

  const hasTrailing = filePath.endsWith(`/`)
  const parsedNameWithSlash = `${parsedName}${
    option === `legacy` || hasTrailing ? `/` : ``
  }`
  const postfix = applyTrailingSlashOption(parsedNameWithSlash, option)

  return posix.join(`/`, dir, postfix)
}
