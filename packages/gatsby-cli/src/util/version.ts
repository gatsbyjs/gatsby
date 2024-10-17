import { getGatsbyVersion } from "gatsby-core-utils"

export const getLocalGatsbyVersion = (): string => {
  const version = getGatsbyVersion()

  return version
}
