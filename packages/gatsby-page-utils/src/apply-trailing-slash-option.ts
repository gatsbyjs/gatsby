// TODO(v5): Remove legacy setting and default to "always"
export type TrailingSlash = "always" | "never" | "ignore" | "legacy"

export const applyTrailingSlashOption = (
  input: string,
  option: TrailingSlash = `legacy`
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
