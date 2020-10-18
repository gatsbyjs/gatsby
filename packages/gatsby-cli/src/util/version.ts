import { setDefaultTags } from "gatsby-telemetry"
import { getGatsbyVersion } from "gatsby-core-utils"

export const getLocalGatsbyVersion = (): string => {
  const version = getGatsbyVersion()

  try {
    setDefaultTags({ installedGatsbyVersion: version })
  } catch (e) {
    // ignore
  }

  return version
}
