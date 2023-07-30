export type TrailingSlash = "always" | "never" | "ignore"

const endsWithSuffixes = (suffixes: Array<string>, input): boolean => {
  for (const suffix of suffixes) {
    if (input.endsWith(suffix)) return true
  }
  return false
}

const suffixes = [`.html`, `.json`, `.js`, `.map`, `.txt`, `.xml`, `.pdf`]

export const applyTrailingSlashOption = (
  input: string,
  option: TrailingSlash = `always`
): string => {
  if (input === `/`) return input

  const hasTrailingSlash = input.endsWith(`/`)

  if (endsWithSuffixes(suffixes, input)) {
    return input
  }
  if (option === `always`) {
    return hasTrailingSlash ? input : `${input}/`
  }
  if (option === `never`) {
    return hasTrailingSlash ? input.slice(0, -1) : input
  }

  return input
}
