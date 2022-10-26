export type TrailingSlash = "always" | "never" | "ignore"

export const applyTrailingSlashOption = (
  input: string,
  option: TrailingSlash = `always`
): string => {
  const hasHtmlSuffix = input.endsWith(`.html`)
  const hasXmlSuffix = input.endsWith(`.xml`)
  const hasPdfSuffix = input.endsWith(`.pdf`)

  if (input === `/`) return input
  if (hasHtmlSuffix || hasXmlSuffix || hasPdfSuffix) {
    option = `never`
  }
  if (option === `always`) {
    return input.endsWith(`/`) ? input : `${input}/`
  }
  if (option === `never`) {
    return input.endsWith(`/`) ? input.slice(0, -1) : input
  }

  return input
}
