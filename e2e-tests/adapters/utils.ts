import type { GatsbyConfig } from "gatsby"

export const applyTrailingSlashOption = (
  input: string,
  // Normally this is "always" but as part of this test suite we default to "never"
  option: GatsbyConfig["trailingSlash"] = `never`
): string => {
  if (input === `/`) return input

  const hasTrailingSlash = input.endsWith(`/`)

  if (option === `always`) {
    return hasTrailingSlash ? input : `${input}/`
  }
  if (option === `never`) {
    return hasTrailingSlash ? input.slice(0, -1) : input
  }

  return input
}